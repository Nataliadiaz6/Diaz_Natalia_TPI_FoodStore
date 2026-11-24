from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; commit/rollback y close en __exit__."""

    session: Session

    def __enter__(self):
        self.session = session_factory()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
