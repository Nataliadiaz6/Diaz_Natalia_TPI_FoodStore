from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id")
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock: int = Field(default=0)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")  # noqa: F821
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")  # noqa: F821
