from typing import Iterator

from fastapi import Depends, HTTPException, Request
from jose import JWTError
from sqlmodel import Session

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_session() -> Iterator[Session]:
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        user_id = int(decode_access_token(token)["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida")
    user = session.get(Usuario, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida")
    return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]):
    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="No tiene permisos para esta acción")
        return user

    return checker
