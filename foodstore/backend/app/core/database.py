from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=_args)


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)
