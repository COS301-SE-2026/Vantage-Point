"""Shapes for the positional analysis built on top of a match timeline.

These are the inputs and outputs of `app.services.spatial_service`, kept separate from
`app.schemas.timeline` because the timeline schemas describe what Riot sends whereas
these describe what we derive from it — routes, ground covered, and a heatmap.

Coordinates are in Riot map units throughout, never pixels; projecting onto a minimap
image is the client's job and needs `MapBounds` from the timeline response.
"""

from pydantic import BaseModel


class Coordinate(BaseModel):
    """A point in Riot's map coordinate space. Y grows upward, unlike a screen."""

    x: int
    y: int


class PlayerPath(BaseModel):
    """One player's route through a match, in frame order.

    The champion travels with the path so the client can label and colour a route
    without joining back against the scoreboard.
    """

    puuid: str
    champion: str
    path: list[Coordinate]


class SpatialAnalysis(BaseModel):
    """Every player's route, plus distance and heatmap for the player in focus.

    `heatmap_intensity` is a grid laid over the map, row major from the top-left, each
    cell holding that cell's share of the focused player's route. Values sum to 1.0 for
    a non-empty path, so cells can be shaded directly.
    """

    match_id: str
    player_paths: list[PlayerPath]
    total_distance_covered: float
    heatmap_intensity: list[float]
