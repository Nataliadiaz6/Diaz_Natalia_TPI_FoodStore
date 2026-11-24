Tecnicatura Universitaria en Programacion a Distancia - Programacion IV

Alumna: Natalia Diaz

Tutor: Gianfranco Canciani

# Food Store — Trabajo Práctico Integrador

Aplicación web de pedidos de comida. Backend **FastAPI + SQLModel + PostgreSQL** (arquitectura en capas con Unit of Work, JWT en cookie HttpOnly) y frontend **React + TypeScript + Vite + Tailwind** (TanStack Query/Form/Table, Zustand, Axios).

- Repositorio: [Diaz_Natalia_TPI_FoodStore](https://github.com/Nataliadiaz6/Diaz_Natalia_TPI_FoodStore.git)
- Video de demostración: [Video Demostrativo Food Store](https://youtu.be/5Rx0Ovvb-UE)

## Requisitos

- Python 3.11 a 3.13
- PostgreSQL 15 o superior (para desarrollo local se acepta SQLite)
- Node.js 20.19 o superior y pnpm 9 o superior

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # en Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # en Windows: copy .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

La API queda en http://localhost:8000/api/v1 y la documentación en `/docs` y `/redoc`.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| DATABASE_URL | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| SECRET_KEY | Firma del JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| ALGORITHM | Algoritmo del JWT | `HS256` |
| ACCESS_TOKEN_EXPIRE_MINUTES | Expiración del token y la cookie | `30` |
| FRONTEND_ORIGIN | Origen permitido en CORS | `http://localhost:5173` |

### Usuario del seed

`python -m app.db.seed` es idempotente y crea:

- Administrador: usuario `admin`, contraseña `Admin1234!`
- 3 categorías y 8 productos con stock

## Frontend

```bash
cd frontend
cp .env.example .env            # en Windows: copy .env.example .env
pnpm install
pnpm build                      # verifica los tipos
pnpm dev
```

La aplicación queda en http://localhost:5173.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| VITE_API_URL | URL base de la API | `http://localhost:8000/api/v1` |

## Estructura

- `backend/app/core`: configuración, base de datos, seguridad, dependencias, `UnitOfWork` y `BaseRepository[T]`.
- `backend/app/modules`: un paquete por dominio (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con router, service, unit of work, repository, models y schemas.
- `frontend/src/features`: un dominio por carpeta (pages, components, hooks, api, types).
- `frontend/src/shared`, `store`, `routes`: piezas transversales, estado global con Zustand y rutas protegidas.

## Reglas de negocio implementadas

RN-01 creación transaccional del pedido con descuento de stock; RN-02 máquina de estados; RN-03 cancelación con restitución de stock; RN-04 permisos por dueño y rol; RN-05 líneas y total inmutables (sin endpoints de edición ni borrado); RN-06 validación de forma de pago y dirección en el schema.
