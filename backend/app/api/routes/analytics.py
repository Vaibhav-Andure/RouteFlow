from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.models import AnalyticsResponse
from app.services.analytics_service import get_delivery_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/", response_model=AnalyticsResponse)
def get_analytics(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Retrieve delivery analytics.
    Requires authentication.
    """
    # Ensure the user is authenticated (CurrentUser dependency handles this)
    # No specific role check for now, any authenticated user can view analytics

    analytics_data = get_delivery_analytics(session)
    return analytics_data
