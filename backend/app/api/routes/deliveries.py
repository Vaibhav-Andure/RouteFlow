import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, status
from sqlmodel import col, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    DeliveriesPublic,
    Delivery,
    DeliveryCreate,
    DeliveryPublic,
    DeliveryUpdate,
    Message,
)

router = APIRouter(prefix="/deliveries", tags=["deliveries"])
drivers_router = APIRouter(prefix="/drivers", tags=["drivers"])
customers_router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("/", response_model=DeliveriesPublic)
def read_deliveries(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve all deliveries (filtered for DRIVERS to only show their assigned stops).
    """
    if not current_user.is_superuser:
        count_statement = (
            select(func.count())
            .select_from(Delivery)
            .where(Delivery.driver_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Delivery)
            .where(Delivery.driver_id == current_user.id)
            .order_by(col(Delivery.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
    else:
        count_statement = select(func.count()).select_from(Delivery)
        count = session.exec(count_statement).one()
        statement = (
            select(Delivery).order_by(col(Delivery.created_at).desc()).offset(skip).limit(limit)
        )

    deliveries = session.exec(statement).all()
    deliveries_public = [DeliveryPublic.model_validate(delivery) for delivery in deliveries]
    return DeliveriesPublic(data=deliveries_public, count=count)


@router.get("/{id}", response_model=DeliveryPublic)
def read_delivery(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get delivery by ID. Enforces driver ownership checks.
    """
    delivery = session.get(Delivery, id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    
    if not current_user.is_superuser:
        if delivery.driver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this delivery. Driver mismatch."
            )
            
    return delivery


@router.post("/", response_model=DeliveryPublic)
def create_delivery(
    *, session: SessionDep, current_user: CurrentUser, delivery_in: DeliveryCreate
) -> Any:
    """
    Create new delivery.
    """
    delivery = Delivery.model_validate(delivery_in, update={"owner_id": current_user.id})
    session.add(delivery)
    session.commit()
    session.refresh(delivery)
    return delivery


@router.put("/{id}", response_model=DeliveryPublic)
def update_delivery(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    delivery_in: DeliveryUpdate,
) -> Any:
    """
    Update a delivery.
    """
    delivery = session.get(Delivery, id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    update_dict = delivery_in.model_dump(exclude_unset=True)
    delivery.sqlmodel_update(update_dict)
    session.add(delivery)
    session.commit()
    session.refresh(delivery)
    return delivery


@router.delete("/{id}")
def delete_delivery(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a delivery.
    """
    delivery = session.get(Delivery, id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    session.delete(delivery)
    session.commit()
    return Message(message="Delivery deleted successfully")


# ==================================================
# STUB ENDPOINTS FOR REMOVED DRIVER/CUSTOMER MODULES
# ==================================================

@drivers_router.get("/me/deliveries", response_model=DeliveriesPublic)
def read_driver_deliveries(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Stub for driver deliveries.
    """
    return DeliveriesPublic(data=[], count=0)


@customers_router.get("/me/deliveries", response_model=DeliveriesPublic)
def read_customer_deliveries(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Stub for customer deliveries.
    """
    return DeliveriesPublic(data=[], count=0)
