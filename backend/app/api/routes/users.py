import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import col, delete, func, select

from app import crud
from app.api.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
)
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    Item,
    Message,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
    Driver,
)
from app.utils import generate_new_account_email, send_email

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = (
        select(User).order_by(col(User.created_at).desc()).offset(skip).limit(limit)
    )
    users = session.exec(statement).all()

    users_public = []
    for user in users:
        u_pub = UserPublic.model_validate(user)
        if not user.is_superuser:
            driver = session.exec(select(Driver).where(Driver.user_id == user.id)).first()
            if driver:
                u_pub.phone = driver.phone
                u_pub.vehicle_type = driver.vehicle_type
                u_pub.vehicle_capacity = driver.vehicle_capacity
                u_pub.license_number = driver.license_number
        users_public.append(u_pub)

    return UsersPublic(data=users_public, count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    db_user = crud.create_user(session=session, user_create=user_in)

    db_driver = None
    if not db_user.is_superuser:
        db_driver = Driver(
            user_id=db_user.id,
            phone=user_in.phone or "",
            vehicle_type=user_in.vehicle_type or "Van",
            vehicle_capacity=user_in.vehicle_capacity or 50.0,
            license_number=user_in.license_number or "",
        )
        session.add(db_driver)
        session.commit()

    u_pub = UserPublic.model_validate(db_user)
    if db_driver:
        u_pub.phone = db_driver.phone
        u_pub.vehicle_type = db_driver.vehicle_type
        u_pub.vehicle_capacity = db_driver.vehicle_capacity
        u_pub.license_number = db_driver.license_number
    return u_pub


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """
    Update own user.
    """
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    u_pub = UserPublic.model_validate(current_user)
    if not current_user.is_superuser:
        driver = session.exec(select(Driver).where(Driver.user_id == current_user.id)).first()
        if driver:
            u_pub.phone = driver.phone
            u_pub.vehicle_type = driver.vehicle_type
            u_pub.vehicle_capacity = driver.vehicle_capacity
            u_pub.license_number = driver.license_number
    return u_pub


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    """
    Update own password.
    """
    verified, _ = verify_password(body.current_password, current_user.hashed_password)
    if not verified:
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.get("/me", response_model=UserPublic)
def read_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    u_pub = UserPublic.model_validate(current_user)
    if not current_user.is_superuser:
        driver = session.exec(select(Driver).where(Driver.user_id == current_user.id)).first()
        if driver:
            u_pub.phone = driver.phone
            u_pub.vehicle_type = driver.vehicle_type
            u_pub.vehicle_capacity = driver.vehicle_capacity
            u_pub.license_number = driver.license_number
    return u_pub


@router.delete("/me", response_model=Message)
def delete_user_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """
    Delete own user.
    """
    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()
    return Message(message="User deleted successfully")


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    """
    Create new user without the need to be logged in.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    # 1. Create standard User
    user_create = UserCreate(
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
        is_superuser=False,
    )
    db_user = crud.create_user(session=session, user_create=user_create)

    # 2. Create Driver record
    db_driver = Driver(
        user_id=db_user.id,
        phone=user_in.phone or "",
        vehicle_type=user_in.vehicle_type or "Van",
        vehicle_capacity=user_in.vehicle_capacity or 50.0,
        license_number=user_in.license_number or "",
    )
    session.add(db_driver)
    session.commit()

    # 3. Format response
    response_user = UserPublic.model_validate(db_user)
    response_user.phone = db_driver.phone
    response_user.vehicle_type = db_driver.vehicle_type
    response_user.vehicle_capacity = db_driver.vehicle_capacity
    response_user.license_number = db_driver.license_number
    return response_user


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Get a specific user by id.
    """
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user != current_user and not current_user.is_superuser:
        raise HTTPException(
            status_code=403,
            detail="The user doesn't have enough privileges",
        )
    
    u_pub = UserPublic.model_validate(user)
    if not user.is_superuser:
        driver = session.exec(select(Driver).where(Driver.user_id == user.id)).first()
        if driver:
            u_pub.phone = driver.phone
            u_pub.vehicle_type = driver.vehicle_type
            u_pub.vehicle_capacity = driver.vehicle_capacity
            u_pub.license_number = driver.license_number
    return u_pub


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    """
    Update a user.
    """
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)

    db_driver = None
    if not db_user.is_superuser:
        driver = session.exec(select(Driver).where(Driver.user_id == db_user.id)).first()
        if not driver:
            driver = Driver(user_id=db_user.id, phone="", vehicle_type="Van", vehicle_capacity=50.0, license_number="")
        
        if user_in.phone is not None:
            driver.phone = user_in.phone
        if user_in.vehicle_type is not None:
            driver.vehicle_type = user_in.vehicle_type
        if user_in.vehicle_capacity is not None:
            driver.vehicle_capacity = user_in.vehicle_capacity
        if user_in.license_number is not None:
            driver.license_number = user_in.license_number
            
        session.add(driver)
        session.commit()
        db_driver = driver

    u_pub = UserPublic.model_validate(db_user)
    if db_driver:
        u_pub.phone = db_driver.phone
        u_pub.vehicle_type = db_driver.vehicle_type
        u_pub.vehicle_capacity = db_driver.vehicle_capacity
        u_pub.license_number = db_driver.license_number
    return u_pub


@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    """
    Delete a user.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == user_id)
    session.exec(statement)
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
