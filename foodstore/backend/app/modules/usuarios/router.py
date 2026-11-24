from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])
admin_only = require_role(["admin"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar(_: Usuario = Depends(admin_only), service: UsuarioService = Depends(get_usuario_service)):
    return service.listar()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activar(user_id: int, admin: Usuario = Depends(admin_only), service: UsuarioService = Depends(get_usuario_service)):
    return service.activar(user_id, admin.id)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def desactivar(user_id: int, admin: Usuario = Depends(admin_only), service: UsuarioService = Depends(get_usuario_service)):
    return service.desactivar(user_id, admin.id)
