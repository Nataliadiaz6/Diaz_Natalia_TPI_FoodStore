"""Seed idempotente: python -m app.db.seed"""
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos import models as _ped  # noqa: F401
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, jugos y agua"),
]

PRODUCTOS = [
    ("Hamburguesa clásica", "Carne, lechuga, tomate y queso", 5500, "Hamburguesas", 30),
    ("Hamburguesa doble", "Doble carne y cheddar", 7200, "Hamburguesas", 25),
    ("Hamburguesa veggie", "Medallón de lentejas", 6000, "Hamburguesas", 20),
    ("Pizza muzzarella", "Muzzarella y aceitunas", 8500, "Pizzas", 15),
    ("Pizza napolitana", "Tomate, ajo y muzzarella", 9300, "Pizzas", 15),
    ("Gaseosa 500ml", "Cola, lima-limón o naranja", 1800, "Bebidas", 60),
    ("Jugo de naranja", "Exprimido natural", 2200, "Bebidas", 40),
    ("Agua mineral", "Sin gas 500ml", 1200, "Bebidas", 80),
]


def run() -> None:
    create_all_tables()
    with session_factory() as s:
        if not s.exec(select(Usuario).where(Usuario.username == "admin")).first():
            s.add(Usuario(username="admin", full_name="Administrador", email="admin@foodstore.com",
                          hashed_password=hash_password("Admin1234!"), role="admin"))
        for nombre, desc in CATEGORIAS:
            if not s.exec(select(Categoria).where(Categoria.nombre == nombre)).first():
                s.add(Categoria(nombre=nombre, descripcion=desc))
        s.commit()
        cats = {c.nombre: c.id for c in s.exec(select(Categoria)).all()}
        for nombre, desc, precio, cat, stock in PRODUCTOS:
            if not s.exec(select(Producto).where(Producto.nombre == nombre)).first():
                s.add(Producto(nombre=nombre, descripcion=desc, precio_base=precio, stock=stock,
                               categoria_id=cats[cat], imagen_url=None))
        s.commit()
    print("Seed completado (admin / Admin1234!)")


if __name__ == "__main__":
    run()
