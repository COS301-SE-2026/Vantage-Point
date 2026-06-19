from typing import List
from pydantic import BaseModel


class Coordinate(BaseModel):
    x: float
    y: float


class PlayerPath(BaseModel):
    puuid: str
    champion: str
    path: List[Coordinate]  # List of (x,y) points over time


class SpatialAnalysis(BaseModel):
    match_id: str
    player_paths: List[PlayerPath]
    total_distance_covered: float
    heatmap_intensity: List[float]
