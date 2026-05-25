from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUser
from app.models import RouteOptimizationRequest, RouteOptimizationResponse
from app.services.route_optimizer import optimize_route

router = APIRouter(prefix="/optimization", tags=["optimization"])


@router.post("/optimize-route", response_model=RouteOptimizationResponse)
def optimize_delivery_route(
    current_user: CurrentUser, request: RouteOptimizationRequest
) -> Any:
    """
    Calculate the optimal delivery route using Google OR-Tools (Traveling Salesperson Problem).
    Requires authentication.
    """
    # Format inputs for the service
    warehouse_coords = (request.warehouse.latitude, request.warehouse.longitude)
    
    delivery_data = [
        {"id": d.id, "lat": d.latitude, "lon": d.longitude} 
        for d in request.deliveries
    ]
    
    # Call the optimization service
    optimized_route, total_dist, est_time = optimize_route(warehouse_coords, delivery_data)
    
    # Return formatted response matching the Pydantic schema
    return RouteOptimizationResponse(
        optimized_route=optimized_route,
        total_distance_km=total_dist,
        estimated_time_minutes=est_time
    )
