import math
from typing import List, Tuple
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import uuid


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """
    Calculate the great circle distance in meters between two points on the earth.
    OR-Tools requires integer costs, so we return meters.
    """
    R = 6371000  # Radius of earth in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (
        math.sin(dphi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return int(R * c)


def calculate_estimated_time(distance_km: float) -> float:
    """
    Estimate travel time based on distance.
    Assumes an average speed of 30 km/h in urban areas + 5 mins drop-off per stop.
    For simplicity, we just use a flat 30km/h (0.5 km/min).
    """
    # Time = Distance / Speed. (km / (km/min))
    average_speed_km_per_minute = 30 / 60.0
    return distance_km / average_speed_km_per_minute


def optimize_route(
    warehouse: Tuple[float, float], deliveries: List[dict]
) -> Tuple[List[dict], float, float]:
    """
    Solves the Traveling Salesperson Problem (TSP) using Google OR-Tools.
    
    Args:
        warehouse: (latitude, longitude) of the starting point.
        deliveries: List of dicts containing 'id', 'lat', 'lon'.

    Returns:
        Tuple containing:
        - List of dicts representing the optimized route order: [{'delivery_id': UUID, 'order': int}]
        - Total distance in kilometers (float).
        - Estimated time in minutes (float).
    """
    # Node 0 is the warehouse
    locations = [warehouse] + [(d["lat"], d["lon"]) for d in deliveries]
    num_locations = len(locations)

    # Edge cases
    if num_locations == 1:
        return [], 0.0, 0.0

    # 1. Create Distance Matrix
    distance_matrix = []
    for i in range(num_locations):
        row = []
        for j in range(num_locations):
            if i == j:
                row.append(0)
            else:
                dist = haversine_distance(
                    locations[i][0], locations[i][1], locations[j][0], locations[j][1]
                )
                row.append(dist)
        distance_matrix.append(row)

    # 2. Setup OR-Tools Routing Index Manager and Model
    # manager = pywrapcp.RoutingIndexManager(number_of_locations, number_of_vehicles, depot_node)
    manager = pywrapcp.RoutingIndexManager(num_locations, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index: int, to_index: int) -> int:
        """Returns the distance between the two nodes."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # 3. Solve the TSP
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        # If no solution is found (rare for simple TSP without constraints), return empty
        return [], 0.0, 0.0

    # 4. Extract Route Order and Distance
    route_order = []
    index = routing.Start(0)
    
    # We skip the warehouse in the output list (since it's not a delivery)
    # But we track the order number
    order_counter = 1
    
    # routing.IsEnd(index) is true when we return to the warehouse
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        if node != 0:  # Skip the warehouse
            # The node index maps directly to the deliveries list index + 1
            delivery_id = deliveries[node - 1]["id"]
            route_order.append({"delivery_id": delivery_id, "order": order_counter})
            order_counter += 1
        index = solution.Value(routing.NextVar(index))

    # Total distance in meters
    total_distance_meters = solution.ObjectiveValue()
    total_distance_km = round(total_distance_meters / 1000.0, 2)
    
    # Add a flat 5-minute penalty per delivery stop
    estimated_time = round(calculate_estimated_time(total_distance_km) + (len(deliveries) * 5), 2)

    return route_order, total_distance_km, estimated_time
