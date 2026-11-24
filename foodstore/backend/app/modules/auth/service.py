from fastapi import HTTPException

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(data.email):
                raise HTTPException(status_code=409, detail="El username o el email ya existen")
            user = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email,
                hashed_password=hash_password(data.password),
                role="user",
            )
            uow.usuarios.add(user)
            return UserPublic.model_validate(user)

    def login(self, username: str, password: str) -> str:
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password, user.hashed_password):
                raise HTTPException(status_code=401, detail="Credenciales incorrectas")
            if user.disabled:
                raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
            return create_access_token(str(user.id))
