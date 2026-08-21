"""Response shape for the route the coaching model recommends through a match.

Mirrors `schemas/timeline.py`: the same map coordinate space, keyed to the same frame
timestamps, so the client can draw this line against the walked one without converting
between two spaces.
"""

from pydantic import BaseModel

from app.schemas.timeline import TimelinePosition


class SuggestedPathPoint(BaseModel):
    """One recommended position, keyed to the timeline frame it belongs to."""

    timestamp_ms: int
    position: TimelinePosition


class SuggestedPathResponse(BaseModel):
    match_id: str
    puuid: str
    points: list[SuggestedPathPoint]
