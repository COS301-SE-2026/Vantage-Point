"""The adapter between the KNN route model and the shape the replay screen draws."""

import pytest

from app.Models.riot_schemas import MapSuggestData
from app.pred_engine.ai_caller import get_knn_output
from app.services import suggested_path as module
from app.services.suggested_path import suggested_path_points


def map_suggest_data(frames: int) -> MapSuggestData:
    """A player walking a straight diagonal, one frame a minute."""
    xs = [1000 + i * 500 for i in range(frames)]
    ys = [1000 + i * 400 for i in range(frames)]
    per_frame = [0] * frames

    return MapSuggestData(
        position_x=xs,
        position_y=ys,
        team_position="MIDDLE",
        lane="MIDDLE",
        role="SOLO",
        timestamp=[i * 60_000 for i in range(frames)],
        prev_x=xs,
        prev_y=ys,
        prev_prev_x=xs,
        prev_prev_y=ys,
        champExperience=9000,
        champLevel=12,
        championId=23,
        gameDuration=1500,
        deaths=3,
        itemsPurchased=18,
        killingSprees=0,
        kills=2,
        visionScore=9,
        jungleMinionsKilled=per_frame,
        level=per_frame,
        minionsKilled=per_frame,
        timeEnemySpentControlled=per_frame,
        xp=per_frame,
        totalDamageDone=per_frame,
        totalDamageDoneToChampions=per_frame,
        totalDamageTaken=per_frame,
        abilityHaste=per_frame,
        abilityPower=per_frame,
        armor=per_frame,
        attackDamage=per_frame,
        attackSpeed=per_frame,
        ccReduction=per_frame,
        cooldownReduction=per_frame,
        health=per_frame,
        health_max=per_frame,
        health_regen=per_frame,
        lifesteal=per_frame,
        movementSpeed=per_frame,
        power=per_frame,
        powerMax=per_frame,
    )


@pytest.fixture
def model_returns(monkeypatch):
    """Stands in for the trained model, which costs minutes to build."""

    def _set(coords):
        monkeypatch.setattr(module, "get_knn_output", lambda _: coords)

    return _set


class TestSuggestedPathPoints:
    def test_keys_each_coordinate_to_its_frame(self, model_returns):
        model_returns([[1000, 1000], [2200.0, 1900.0], [3100.0, 2400.0]])

        points = suggested_path_points(map_suggest_data(3))

        assert [p.timestamp_ms for p in points] == [0, 60_000, 120_000]
        assert [(p.position.x, p.position.y) for p in points] == [
            (1000, 1000),
            (2200, 1900),
            (3100, 2400),
        ]

    def test_rounds_the_regressors_fractional_positions(self, model_returns):
        # Riot's map coordinates are integers; the regressor's are not.
        model_returns([[1000, 1000], [2229.614495375155, 2138.891087130153]])

        points = suggested_path_points(map_suggest_data(2))

        assert (points[1].position.x, points[1].position.y) == (2230, 2139)

    def test_stops_where_the_frames_run_out(self, model_returns):
        # The model is fed one row per frame, so a longer output means the two have
        # drifted apart and the extra points have no time to be drawn at.
        model_returns([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]])

        points = suggested_path_points(map_suggest_data(3))

        assert len(points) == 3

    def test_yields_nothing_when_the_model_has_nothing_to_say(self, model_returns):
        model_returns([])

        assert suggested_path_points(map_suggest_data(3)) == []


class TestShortMatches:
    """`correct_knn` needs a stride to measure against, and used to raise without one."""

    def test_no_frames_predicts_nothing(self):
        assert get_knn_output([]) == []

    def test_no_frames_reaches_the_adapter_as_an_empty_path(self):
        assert suggested_path_points(map_suggest_data(0)) == []
