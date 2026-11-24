from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import CambioEstado, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])
admin_only = require_role(["admin"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _http(e: Exception) -> HTTPException:
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        code = 404
    elif isinstance(e, PedidoAjeno):
        code = 403
    else:
        code = 400
    return HTTPException(status_code=code, detail=str(e))


_ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaNegocio)


@router.post("", response_model=PedidoRead, status_code=201)
def crear(data: PedidoCreate, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.crear(user.id, data)
    except _ERRORES as e:
        raise _http(e)


@router.get("", response_model=PedidosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[str] = None,
    user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.listar(user.id, user.role == "admin", estado, skip, limit)


# Se declara antes de /{pedido_id}
@router.get("/resumen", response_model=ResumenPedidos)
def resumen(_: Usuario = Depends(admin_only), service: PedidoService = Depends(get_pedido_service)):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def detalle(pedido_id: int, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.obtener(pedido_id, user.id, user.role == "admin")
    except _ERRORES as e:
        raise _http(e)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: int, data: CambioEstado, _: Usuario = Depends(admin_only), service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except _ERRORES as e:
        raise _http(e)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(pedido_id: int, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    try:
        return service.cancelar_propio(pedido_id, user.id)
    except _ERRORES as e:
        raise _http(e)
