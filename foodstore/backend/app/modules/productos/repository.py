from typing import Optional

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, list[Producto]]:
        stmt = select(Producto).where(col(Producto.activo) == True)  # noqa: E712
        if search:
            stmt = stmt.where(func.lower(Producto.nombre).like(f"%{search.lower()}%"))
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)
        total = self.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = list(self.session.exec(stmt.order_by(Producto.id).offset(skip).limit(limit)).all())
        return total, items
