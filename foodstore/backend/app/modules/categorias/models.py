from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: Optional[str] = None
    activo: bool = Field(default=True)

    productos: List["Producto"] = Relationship(back_populates="categoria")  # noqa: F821
