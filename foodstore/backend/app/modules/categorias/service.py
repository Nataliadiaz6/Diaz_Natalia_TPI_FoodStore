from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        cat = uow.categorias.get_by_id(categoria_id)
        if cat is None or not cat.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return cat

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            cat = uow.categorias.add(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(cat)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            cat = self._activa(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            nombre = cambios.get("nombre")
            if nombre and nombre != cat.nombre and uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            for campo, valor in cambios.items():
                setattr(cat, campo, valor)
            return CategoriaRead.model_validate(cat)

    def eliminar(self, categoria_id: int) -> None:
        with self.uow as uow:
            self._activa(uow, categoria_id).activo = False
