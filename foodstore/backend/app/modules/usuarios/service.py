from fastapi import HTTPException

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all(0, 1000)]

    def _cambiar(self, user_id: int, disabled: bool, actor_id: int) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if user is None:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")
            if disabled and user.id == actor_id:
                raise HTTPException(status_code=400, detail="El administrador no puede desactivarse a sí mismo")
            user.disabled = disabled
            return UserPublic.model_validate(user)

    def activar(self, user_id: int, actor_id: int) -> UserPublic:
        return self._cambiar(user_id, False, actor_id)

    def desactivar(self, user_id: int, actor_id: int) -> UserPublic:
        return self._cambiar(user_id, True, actor_id)
