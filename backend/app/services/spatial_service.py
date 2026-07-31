"""Positional analysis over a match timeline.

Riot's timeline samples every player's map position once a frame (a minute by default).
That is enough to reconstruct a walking route and to say how much ground someone
covered, which is what the replay map draws.

Distances are in Riot map units. Summoner's Rift is roughly 14 870 units across, so a
full lap of the map is about 21 000 units — useful as a relative measure between
players in the same game rather than as an absolute.
"""

import math

from app.schemas.spatial_schemas import Coordinate, PlayerPath, SpatialAnalysis

# Riot map extents per mapId. The minimap art the client draws over spans exactly this
# box, so a position maps to a pixel by simple linear interpolation (with the Y axis
# flipped, because Riot's Y grows upward).
MAP_BOUNDS: dict[int, tuple[int, int, int, int]] = {
    # Summoner's Rift
    11: (0, 0, 14870, 14980),
    # Howling Abyss
    12: (-28, -19, 12849, 12858),
}

DEFAULT_MAP_BOUNDS = MAP_BOUNDS[11]

# A player who crosses the map between two frames has recalled or teleported rather than
# walked. Counting that as ground covered would flatter anyone who died a lot, so hops
# longer than this are left out of the total.
MAX_WALKED_STEP = 6000.0


def map_bounds_for(map_id: int) -> tuple[int, int, int, int]:
    return MAP_BOUNDS.get(map_id, DEFAULT_MAP_BOUNDS)


def distance_between(first: Coordinate, second: Coordinate) -> float:
    return math.dist((first.x, first.y), (second.x, second.y))


def path_distance(path: list[Coordinate]) -> float:
    """Total ground covered along a route, ignoring recall and teleport jumps."""
    total = 0.0
    for previous, current in zip(path, path[1:]):
        step = distance_between(previous, current)
        if step <= MAX_WALKED_STEP:
            total += step
    return total


def build_player_paths(
    positions_by_puuid: dict[str, list[Coordinate]],
    champions_by_puuid: dict[str, str],
) -> list[PlayerPath]:
    return [
        PlayerPath(
            puuid=puuid,
            champion=champions_by_puuid.get(puuid, "Unknown"),
            path=path,
        )
        for puuid, path in positions_by_puuid.items()
    ]


def heatmap_intensity(
    path: list[Coordinate],
    map_id: int = 11,
    *,
    grid: int = 8,
) -> list[float]:
    """Share of the route spent in each cell of a `grid` x `grid` overlay, row major.

    Values sum to 1.0 for a non-empty path, so the client can shade cells directly.
    """
    if not path:
        return [0.0] * (grid * grid)

    min_x, min_y, max_x, max_y = map_bounds_for(map_id)
    span_x = max(1, max_x - min_x)
    span_y = max(1, max_y - min_y)
    cells = [0.0] * (grid * grid)

    for point in path:
        col = min(grid - 1, max(0, int((point.x - min_x) / span_x * grid)))
        # Row 0 is the top of the image, which is the *high* end of Riot's Y axis.
        row = min(grid - 1, max(0, int((max_y - point.y) / span_y * grid)))
        cells[row * grid + col] += 1

    total = sum(cells)
    return [count / total for count in cells]


def build_spatial_analysis(
    match_id: str,
    positions_by_puuid: dict[str, list[Coordinate]],
    champions_by_puuid: dict[str, str],
    *,
    map_id: int = 11,
    focus_puuid: str | None = None,
) -> SpatialAnalysis:
    """Routes for every player, plus distance and a heatmap for the player in focus."""
    paths = build_player_paths(positions_by_puuid, champions_by_puuid)
    focus_path = positions_by_puuid.get(focus_puuid or "", [])

    return SpatialAnalysis(
        match_id=match_id,
        player_paths=paths,
        total_distance_covered=path_distance(focus_path),
        heatmap_intensity=heatmap_intensity(focus_path, map_id),
    )
