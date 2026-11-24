from datetime import datetime
from typing import Optional

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def _paginar(self, usuario_id: Optional[int], estado: Optional[str], skip: int, limit: int) -> tuple[int, list[Pedido]]:
        stmt = select(Pedido)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        if estado:
            stmt = stmt.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = list(self.session.exec(stmt.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)).all())
        return total, items

    def list_by_usuario(self, usuario_id: int, estado: Optional[str], skip: int, limit: int) -> tuple[int, list[Pedido]]:
        return self._paginar(usuario_id, estado, skip, limit)

    def list_all(self, estado: Optional[str], skip: int, limit: int) -> tuple[int, list[Pedido]]:
        return self._paginar(None, estado, skip, limit)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def refresh(self, pedido: Pedido) -> None:
        self.session.flush()
        self.session.refresh(pedido)

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: n for estado, n in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def sum_total_entregados(self) -> float:
        return float(self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == "ENTREGADO")).one())
