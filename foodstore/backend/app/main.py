from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias import models as _cat  # noqa: F401  (registra las tablas)
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos import models as _ped  # noqa: F401
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos import models as _prod  # noqa: F401
from app.modules.productos.router import router as productos_router
from app.modules.usuarios import models as _usr  # noqa: F401
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_all_tables()
    yield


app = FastAPI(title="Food Store API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(r, prefix="/api/v1")
