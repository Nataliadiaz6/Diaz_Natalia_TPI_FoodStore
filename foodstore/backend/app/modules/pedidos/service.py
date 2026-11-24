from typing import Optional

from app.core.database import utcnow
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado  # noqa: F401  (se reexporta al router)

# Mapa de transiciones válidas (RN-02)
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaNegocio(Exception):
    """Base de las reglas de negocio que responden 400."""


class StockInsuficiente(ReglaNegocio):
    pass


class ProductoNoDisponible(ReglaNegocio):
    pass


class ProductoRepetido(ReglaNegocio):
    pass


class TransicionInvalida(ReglaNegocio):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _restituir_y_cancelar(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        # RN-03: restituir stock de cada línea en la misma transacción
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
        pedido.estado = "CANCELADO"
        pedido.updated_at = utcnow()

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            ids = [i.producto_id for i in data.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido("No puede haber productos repetidos en el pedido")
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0.0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente para '{producto.nombre}'")
                producto.stock -= item.cantidad
                subtotal = producto.precio_base * item.cantidad
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal
            pedido.total = total
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario_id: int, es_admin: bool, estado: Optional[str], skip: int, limit: int) -> PedidosPaginados:
        with self.uow as uow:
            if es_admin:
                total, items = uow.pedidos.list_all(estado, skip, limit)
            else:
                total, items = uow.pedidos.list_by_usuario(usuario_id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if nuevo not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"Transición inválida: {pedido.estado} → {nuevo}")
            if nuevo == "CANCELADO":
                self._restituir_y_cancelar(uow, pedido)
            else:
                pedido.estado = nuevo
                pedido.updated_at = utcnow()
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._restituir_y_cancelar(uow, pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            hoy = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(hoy),
                ingresos_entregados=uow.pedidos.sum_total_entregados(),
            )
