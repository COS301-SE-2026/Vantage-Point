"""Joins the KNN route model to the shape the replay screen draws.

`get_knn_output` returns bare `[x, y]` pairs with nothing to say when each one happens.
They are index-aligned with the frames `map_suggest_data` fed the model, so the
timestamps are recovered here rather than guessed on the client, which reads its
timeline from a different endpoint and could hold a different number of frames.
"""

from app.Models.riot_schemas import MapSuggestData
from app.pred_engine.ai_caller import get_knn_output
from app.schemas.suggested_path import SuggestedPathPoint
from app.schemas.timeline import TimelinePosition


def suggested_path_points(data: MapSuggestData) -> list[SuggestedPathPoint]:
    """The recommended route, or an empty list where the model has nothing to say.

    The first point is the player's own starting position rather than a prediction:
    the model corrects a route from where the player actually began, so the two lines
    on the map share an origin and diverge from there.
    """
    coords = get_knn_output(data.convert_to_arr())

    points = []
    for index, coord in enumerate(coords):
        if index >= len(data.timestamp) or len(coord) < 2:
            break
        points.append(
            SuggestedPathPoint(
                timestamp_ms=data.timestamp[index],
                # Riot's positions are integers and the regressor's are not, so the
                # sub-unit precision it invents is dropped rather than carried.
                position=TimelinePosition(x=round(coord[0]), y=round(coord[1])),
            )
        )

    return points
