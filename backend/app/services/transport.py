"""
Transport service for finding nearby transportation options using OpenStreetMap Overpass API
"""

import math
import httpx
from typing import Optional, Dict, Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the distance between two points on Earth using Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


async def get_nearby_transport(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Find nearby transportation options within 10km radius using Overpass API.
    
    Args:
        latitude: User's latitude
        longitude: User's longitude
    
    Returns:
        Dictionary with nearest airport, bus station, and metro station
    """
    radius = 10000  # 10km in meters
    
    # Overpass query to find airports, bus stations, and metro stations
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["aeroway"="aerodrome"](around:{radius},{latitude},{longitude});
      way["aeroway"="aerodrome"](around:{radius},{latitude},{longitude});
      node["amenity"="bus_station"](around:{radius},{latitude},{longitude});
      way["amenity"="bus_station"](around:{radius},{latitude},{longitude});
      node["highway"="bus_stop"](around:{radius},{latitude},{longitude});
      node["railway"="station"]["subway"="yes"](around:{radius},{latitude},{longitude});
      way["railway"="station"]["subway"="yes"](around:{radius},{latitude},{longitude});
    );
    out center;
    """
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://overpass-api.de/api/interpreter",
            data={"data": overpass_query},
            timeout=30.0
        )
        response.raise_for_status()
        data = response.json()
    
    # Initialize results
    results = {
        "nearest_airport": None,
        "nearest_bus_station": None,
        "nearest_metro_station": None
    }
    
    # Process elements
    airports = []
    bus_stations = []
    metro_stations = []
    
    for element in data.get("elements", []):
        # Get coordinates
        if element["type"] == "node":
            lat = element["lat"]
            lon = element["lon"]
        elif element["type"] == "way" and "center" in element:
            lat = element["center"]["lat"]
            lon = element["center"]["lon"]
        else:
            continue
        
        # Calculate distance from user location
        distance = haversine_distance(latitude, longitude, lat, lon)
        
        # Get name
        name = element.get("tags", {}).get("name", "Unknown")
        
        # Categorize by type
        tags = element.get("tags", {})
        
        if tags.get("aeroway") == "aerodrome":
            airports.append({
                "name": name,
                "latitude": lat,
                "longitude": lon,
                "distance_km": round(distance, 2)
            })
        elif tags.get("amenity") == "bus_station" or tags.get("highway") == "bus_stop":
            bus_stations.append({
                "name": name,
                "latitude": lat,
                "longitude": lon,
                "distance_km": round(distance, 2)
            })
        elif tags.get("railway") == "station" and tags.get("subway") == "yes":
            metro_stations.append({
                "name": name,
                "latitude": lat,
                "longitude": lon,
                "distance_km": round(distance, 2)
            })
    
    # Find nearest for each category
    if airports:
        nearest = min(airports, key=lambda x: x["distance_km"])
        results["nearest_airport"] = nearest
    
    if bus_stations:
        nearest = min(bus_stations, key=lambda x: x["distance_km"])
        results["nearest_bus_station"] = nearest
    
    if metro_stations:
        nearest = min(metro_stations, key=lambda x: x["distance_km"])
        results["nearest_metro_station"] = nearest
    
    return results
