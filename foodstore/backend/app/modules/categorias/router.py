from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])
admin_only = require_role(["admin"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


def _http(e: Exception) -> HTTPException:
    return HTTPException(status_code=404 if isinstance(e, CategoriaNoEncontrada) else 409, detail=str(e))


@router.get("", response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def detalle(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise _http(e)


@router.post("", response_model=CategoriaRead, status_code=201)
def crear(data: CategoriaCreate, _: Usuario = Depends(admin_only), service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.crear(data)
    except NombreDuplicado as e:
        raise _http(e)


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(categoria_id: int, data: CategoriaUpdate, _: Usuario = Depends(admin_only), service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.actualizar(categoria_id, data)
    except (CategoriaNoEncontrada, NombreDuplicado) as e:
        raise _http(e)


@router.delete("/{categoria_id}", status_code=204)
def eliminar(categoria_id: int, _: Usuario = Depends(admin_only), service: CategoriaService = Depends(get_categoria_service)):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise _http(e)
    return Response(status_code=204)
