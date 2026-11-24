from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])
admin_only = require_role(["admin"])
NoEncontrado = (ProductoNoEncontrado, CategoriaNoEncontrada)


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    service: ProductoService = Depends(get_producto_service),
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def detalle(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(producto_id)
    except NoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=201)
def crear(data: ProductoCreate, _: Usuario = Depends(admin_only), service: ProductoService = Depends(get_producto_service)):
    try:
        return service.crear(data)
    except NoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(producto_id: int, data: ProductoUpdate, _: Usuario = Depends(admin_only), service: ProductoService = Depends(get_producto_service)):
    try:
        return service.actualizar(producto_id, data)
    except NoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(producto_id: int, data: ProductoStockUpdate, _: Usuario = Depends(admin_only), service: ProductoService = Depends(get_producto_service)):
    try:
        return service.actualizar_stock(producto_id, data)
    except NoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{producto_id}", status_code=204)
def eliminar(producto_id: int, _: Usuario = Depends(admin_only), service: ProductoService = Depends(get_producto_service)):
    try:
        service.eliminar(producto_id)
    except NoEncontrado as e:
        raise HTTPException(status_code=404, detail=str(e))
    return Response(status_code=204)
