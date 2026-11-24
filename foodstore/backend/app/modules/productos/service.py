from typing import Optional

from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    @staticmethod
    def _activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        prod = uow.productos.get_by_id(producto_id)
        if prod is None or not prod.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return prod

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        cat = uow.categorias.get_by_id(categoria_id)
        if cat is None or not cat.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")

    def listar(self, skip: int, limit: int, search: Optional[str], categoria_id: Optional[int], disponible: Optional[bool]) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            prod = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(prod)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            prod = self._activo(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("categoria_id") is not None:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(prod, campo, valor)
            uow.session.flush()
            uow.session.refresh(prod)
            return ProductoRead.model_validate(prod)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            prod = self._activo(uow, producto_id)
            prod.stock = data.stock
            if data.disponible is not None:
                prod.disponible = data.disponible
            return ProductoRead.model_validate(prod)

    def eliminar(self, producto_id: int) -> None:
        with self.uow as uow:
            self._activo(uow, producto_id).activo = False
