"""Response shapes for the Match-V5 timeline.

Riot keys the timeline by `participantId` (1-10); everything here is re-keyed to PUUID
so the client can join it against the scoreboard it already has without carrying a
second identifier around.
"""

from pydantic import BaseModel, Field


class TimelinePosition(BaseModel):
    """A point in Riot's map coordinate space, not in pixels."""

    x: int
    y: int


class MapBounds(BaseModel):
    """Extent of the playable map, so the client can project positions onto its image.

    Riot's Y axis points up and a screen's points down, which is the client's job to
    flip. These are the raw game bounds.
    """

    min_x: int
    min_y: int
    max_x: int
    max_y: int


class TimelineParticipantFrame(BaseModel):
    """One player's state at one frame. Riot samples these once a minute."""

    puuid: str
    position: TimelinePosition
    level: int
    damage_to_champions: int = 0
    xp: int
    cs: int
    current_gold: int
    total_gold: int
    health: int
    health_max: int
    armor: int
    magic_resist: int
    attack_damage: int
    ability_power: int
    movement_speed: int


class TimelineFrame(BaseModel):
    timestamp_ms: int
    participants: list[TimelineParticipantFrame]


class TimelineEvent(BaseModel):
    """A notable moment. Fields not carried by a given event type stay None."""

    timestamp_ms: int
    type: str
    position: TimelinePosition | None = None
    actor_puuid: str | None = Field(
        default=None, description="Killer, ward placer or item buyer"
    )
    victim_puuid: str | None = None
    assist_puuids: list[str] = Field(default_factory=list)
    team_id: int | None = None
    item_id: int | None = None
    skill_slot: int | None = Field(default=None, description="1-4 for Q, W, E, R")
    level: int | None = None
    monster_type: str | None = None
    building_type: str | None = None
    lane_type: str | None = None
    ward_type: str | None = None


class TimelineParticipant(BaseModel):
    """Distance covered over the whole game, from the per-frame positions."""

    puuid: str
    distance_travelled: float


class MatchTimelineResponse(BaseModel):
    match_id: str
    frame_interval_ms: int
    game_duration_ms: int
    map_id: int
    map_bounds: MapBounds
    participants: list[TimelineParticipant]
    frames: list[TimelineFrame]
    events: list[TimelineEvent]
