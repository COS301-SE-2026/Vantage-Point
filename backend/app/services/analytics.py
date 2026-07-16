import asyncio
from typing import Any
from app.Models.profile_schemas import LiveAdvancedMetrics
from app.Models.riot_schemas import (
    MapReplay,
    MapSuggestData,
    ProfileData,
    MatchData,
    ChampionData,
    ItemData,
    SkillData,
    RoleData,
    ChampionStats,
    DamageStats,
    Participant
)
from app.services.riot_service import riot_service
from fastapi import HTTPException

internal_server_error: str = "Internal server error"
player_not_found: str = "PLayer not found in match"


class LiveAnalyticsService:
    @staticmethod
    def _empty_live_metrics() -> LiveAdvancedMetrics:
        return LiveAdvancedMetrics(
            games_analyzed=0,
            avg_kda="0.0 / 0.0 / 0.0",
            avg_vision_score=0.0,
            avg_kill_participation_pct=0.0,
            avg_cs_per_minute=0.0,
            avg_damage_per_minute=0.0,
            avg_gold_per_minute=0.0,
            win_rate="0%",
        )

    @staticmethod
    def _get_game_minutes(match: dict[str, Any]) -> float:
        # Explicit type typing prevents "Unknown" tracking inside nested dicts
        info: dict[str, Any] = match.get("info", {})
        duration_seconds: Any = info.get("gameDuration", 1)

        if isinstance(duration_seconds, (int, float)) and duration_seconds > 10000:
            duration_seconds = duration_seconds / 1000

        return float(duration_seconds) / 60.0

    @staticmethod
    def _find_player_and_team_kills(
        participants: list[dict[str, Any]], puuid: str
    ) -> tuple[dict[str, Any] | None, int]:
        player = next((p for p in participants if p.get("puuid") == puuid), None)

        if not player:
            return None, 0

        user_team_id = player.get("teamId")

        team_kills = sum(
            int(p.get("kills", 0))
            for p in participants
            if p.get("teamId") == user_team_id
        )

        return player, team_kills

    @staticmethod
    async def get_live_metrics_from_api(
        server_region: str, puuid: str, count: int = 20
    ) -> LiveAdvancedMetrics:
        """
        Queries live match details through RiotService and returns aggregated performance metrics.
        """
        match_ids = await riot_service.get_match_ids(
            server_region=server_region,
            puuid=puuid,
            count=count,
        )

        if not match_ids:
            return LiveAnalyticsService._empty_live_metrics()

        tasks = [riot_service.get_match_detail(match_id) for match_id in match_ids]
        matches_data: list[dict[str, Any]] = await asyncio.gather(*tasks)

        # Explicitly typing the accumulator dictionary fixes type inference errors
        stats: dict[str, Any] = {
            "kills": 0,
            "deaths": 0,
            "assists": 0,
            "wins": 0,
            "vision": 0,
            "damage": 0,
            "gold": 0,
            "cs": 0,
            "team_kills": 0,
            "duration_minutes": 0.0,
            "games_analyzed": 0,
        }

        for match in matches_data:
            if not match or "info" not in match:
                continue

            info: dict[str, Any] = match["info"]
            participants: list[dict[str, Any]] = info.get("participants", [])

            player, team_kills = LiveAnalyticsService._find_player_and_team_kills(
                participants,
                puuid,
            )

            if not player:
                continue

            stats["games_analyzed"] += 1
            stats["duration_minutes"] += LiveAnalyticsService._get_game_minutes(match)
            stats["team_kills"] += team_kills

            stats["kills"] += player.get("kills", 0)
            stats["deaths"] += player.get("deaths", 0)
            stats["assists"] += player.get("assists", 0)
            stats["vision"] += player.get("visionScore", 0)
            stats["damage"] += player.get("totalDamageDealtToChampions", 0)
            stats["gold"] += player.get("goldEarned", 0)
            stats["cs"] += player.get("totalMinionsKilled", 0) + player.get(
                "neutralMinionsKilled", 0
            )

            if player.get("win"):
                stats["wins"] += 1

        if stats["games_analyzed"] == 0:
            return LiveAnalyticsService._empty_live_metrics()

        return LiveAnalyticsService._build_live_metrics_response(stats)

    @staticmethod
    def _build_live_metrics_response(stats: dict[str, Any]) -> LiveAdvancedMetrics:
        games: int = stats["games_analyzed"]
        duration: float = stats["duration_minutes"] or 1.0

        kill_participation = 0.0

        if stats["team_kills"] > 0:
            kill_participation = (
                (stats["kills"] + stats["assists"]) / stats["team_kills"]
            ) * 100

        return LiveAdvancedMetrics(
            games_analyzed=games,
            avg_kda=(
                f"{stats['kills'] / games:.1f} / "
                f"{stats['deaths'] / games:.1f} / "
                f"{stats['assists'] / games:.1f}"
            ),
            avg_vision_score=round(stats["vision"] / games, 1),
            avg_kill_participation_pct=round(kill_participation, 1),
            avg_cs_per_minute=round(stats["cs"] / duration, 1),
            avg_damage_per_minute=round(stats["damage"] / duration, 1),
            avg_gold_per_minute=round(stats["gold"] / duration, 1),
            win_rate=f"{round((stats['wins'] / games) * 100)}%",
        )

    @staticmethod
    def find_participant_id(participants: Any, puuid: str) -> str | None:        
        for participant in participants:
            if participant["puuid"] == puuid:
                return str(participant["participantId"])
            
        return None
    @staticmethod
    def get_champion_stats(frames: Any, paritcipant_id: str) -> ChampionStats:       
        return ChampionStats(
            abilityPower = [
                frame["participantFrames"][paritcipant_id]["championStats"]["abilityPower"]
                for frame in frames],
            armor = [
                frame["participantFrames"][paritcipant_id]["championStats"]["armor"]
                for frame in frames],
            armorPenPercent = [
                frame["participantFrames"][paritcipant_id]["championStats"]["armorPenPercent"]
                for frame in frames],
            attackDamage = [
                frame["participantFrames"][paritcipant_id]["championStats"]["attackDamage"]
                for frame in frames],
            attackSpeed = [
                frame["participantFrames"][paritcipant_id]["championStats"]["attackSpeed"]
                for frame in frames],
            ccReduction = [
                frame["participantFrames"][paritcipant_id]["championStats"]["ccReduction"]
                for frame in frames],
            health = [
                frame["participantFrames"][paritcipant_id]["championStats"]["health"]
                for frame in frames],
            healthMax = [
                frame["participantFrames"][paritcipant_id]["championStats"]["healthMax"]
                for frame in frames],
            healthRegen = [
                frame["participantFrames"][paritcipant_id]["championStats"]["healthRegen"]
                for frame in frames],
            lifesteal = [
                frame["participantFrames"][paritcipant_id]["championStats"]["lifesteal"]
                for frame in frames],
            magicPen = [
                frame["participantFrames"][paritcipant_id]["championStats"]["magicPen"]
                for frame in frames],
            magicPenPercent = [
                frame["participantFrames"][paritcipant_id]["championStats"]["magicPenPercent"]
                for frame in frames],
            magicResist = [
                frame["participantFrames"][paritcipant_id]["championStats"]["magicResist"]
                for frame in frames],
            movementSpeed = [
                frame["participantFrames"][paritcipant_id]["championStats"]["movementSpeed"]
                for frame in frames],
            omnivamp = [
                frame["participantFrames"][paritcipant_id]["championStats"]["omnivamp"]
                for frame in frames],
            power = [
                frame["participantFrames"][paritcipant_id]["championStats"]["power"]
                for frame in frames],
            powerMax = [
                frame["participantFrames"][paritcipant_id]["championStats"]["powerMax"]
                for frame in frames],
            physicalVamp = [
                frame["participantFrames"][paritcipant_id]["championStats"]["physicalVamp"]
                for frame in frames],
            spellVamp = [
                frame["participantFrames"][paritcipant_id]["championStats"]["spellVamp"]
                for frame in frames]
            
        )

    @staticmethod
    def get_damage_stats(frames: Any, paritcipant_id: str) -> DamageStats:
        return DamageStats(
            magicDamageDone = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["magicDamageDone"]
                for frame in frames],
            magicDamageDoneToChampions = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["magicDamageDoneToChampions"]
                for frame in frames],
            magicDamageTaken = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["magicDamageTaken"]
                for frame in frames],
            physicalDamageDone = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["physicalDamageDone"]
                for frame in frames],
            physicalDamageDoneToChampions = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["physicalDamageDoneToChampions"]
                for frame in frames],
            physicalDamageTaken = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["physicalDamageTaken"]
                for frame in frames],
            totalDamageDone = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["totalDamageDone"]
                for frame in frames],
            totalDamageDoneToChampions = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["totalDamageDoneToChampions"]
                for frame in frames],
            totalDamageTaken = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["totalDamageTaken"]
                for frame in frames],
            trueDamageDone = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["trueDamageDone"]
                for frame in frames],
            trueDamageDoneToChampions = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["trueDamageDoneToChampions"]
                for frame in frames],
            trueDamageTaken = [
                frame["participantFrames"][paritcipant_id]["damageStats"]["trueDamageTaken"]
                for frame in frames],
        )
    
    @staticmethod
    def get_participants_data(frames: Any, paritcipant_id: str) -> Participant:
        return Participant(
            currentGold = [frame["participantFrames"][paritcipant_id]["currentGold"] for frame in frames],
            goldPerSecond = [frame["participantFrames"][paritcipant_id]["goldPerSecond"] for frame in frames],
            jungleMinionsKilled = [frame["participantFrames"][paritcipant_id]["jungleMinionsKilled"] for frame in frames],
            level = [frame["participantFrames"][paritcipant_id]["level"] for frame in frames],
            minionsKilled = [frame["participantFrames"][paritcipant_id]["minionsKilled"] for frame in frames],
            participantId = paritcipant_id,
            timeEnemySpentControlled = [frame["participantFrames"][paritcipant_id]["timeEnemySpentControlled"] for frame in frames],
            totalGold = [frame["participantFrames"][paritcipant_id]["totalGold"] for frame in frames],
            xp = [frame["participantFrames"][paritcipant_id]["xp"] for frame in frames]
        )
    
    # at the moment only the user hence we need the puuid in the the method call as paramater, otherwise no way to know which user you are. Might add it
    # to a env and then just update it when the user changes his/her puuid they are using. Don't have to call/put it in each time
    # added data param for incase I do not have to do the call again only once pass it in and then check and use it if possible
    @staticmethod
    async def map_replay(
        match_id: str, puuid: str | None = None, data: MapReplay | None = None
    ) -> MapReplay:
        if data is None:
            _data: Any = await riot_service.get_match_timeline(match_id)
        else:
            _data = data

        x_values: dict[str, list[int]] = {}
        y_values: dict[str, list[int]] = {}
        frames = _data["info"]["frames"]
        timestamps: Any = [frame["timestamp"] for frame in frames]

        for i in range(1, 10):
            x_values[str(i)] = [
                frame["participantFrames"][str(i)]["position"]["x"] for frame in frames
            ]
            y_values[str(i)] = [
                frame["participantFrames"][str(i)]["position"]["y"] for frame in frames
            ]

        return MapReplay(
            puuid=[p["puuid"] for p in _data["info"]["participants"]],
            participant_id=[
                p["participantId"] for p in _data["info"]["participants"]
            ],  # is a list need to change/update the model as it stands
            frame_interval=_data["info"]["frameInterval"],
            timestamp=timestamps,
            position_x=x_values,
            position_y=y_values,
        )

    @staticmethod
    async def map_suggest_data(match_id: str, puuid: str) -> MapSuggestData:
        timeline = await riot_service.get_match_timeline(match_id)
        match = await riot_service.get_match_detail(match_id)
        # cover part of knn required data
        map_replay: MapReplay = await LiveAnalyticsService.map_replay(match_id)

        paritcipants: Any = match["info"]["participant"]
        player = next(
            (p for p in paritcipants if p["puuid"] == puuid)
        )

        if player is None:
            raise HTTPException(status_code=404, detail=player_not_found)

        frames = timeline["info"]["frames"]
        paritcipant_id = LiveAnalyticsService.find_participant_id(timeline["info"]["participants"], puuid)

        armor = [
            frame["participantFrames"][paritcipant_id]["championStats"]["armor"]
            for frame in frames
        ]
        attack_damage = [
            frame["participantFrames"][paritcipant_id]["championStats"]["attackDamage"]
            for frame in frames
        ]
        attack_speed = [
            frame["participantFrames"][paritcipant_id]["championStats"]["attackSpeed"]
            for frame in frames
        ]
        health = [
            frame["participantFrames"][paritcipant_id]["championStats"]["health"]
            for frame in frames
        ]
        health_max = [
            frame["participantFrames"][paritcipant_id]["championStats"]["healthMax"]
            for frame in frames
        ]
        health_regen = [
            frame["participantFrames"][paritcipant_id]["championStats"]["healthRegen"]
            for frame in frames
        ]
        ability_haste = [
            frame["participantFrames"][paritcipant_id]["championStats"]["abilityHaste"]
            for frame in frames
        ]
        ability_power = [
            frame["participantFrames"][paritcipant_id]["championStats"]["abilityPower"]
            for frame in frames
        ]
        cc_reduction = [
            frame["participantFrames"][paritcipant_id]["championStats"]["ccReduction"]
            for frame in frames
        ]
        cooldown_reduction = [
            frame["participantFrames"][paritcipant_id]["championStats"]["cooldownReduction"]
            for frame in frames
        ]
        lifesteal = [
            frame["participantFrames"][paritcipant_id]["championStats"]["lifesteal"]
            for frame in frames
        ]
        movement_speed = [
            frame["participantFrames"][paritcipant_id]["championStats"]["movementSpeed"]
            for frame in frames
        ]
        power = [
            frame["participantFrames"][paritcipant_id]["championStats"]["power"]
            for frame in frames
        ]
        power_max = [
            frame["participantFrames"][paritcipant_id]["championStats"]["powerMax"]
            for frame in frames
        ]

        total_damage_done = [
            frame["participantFrames"][paritcipant_id]["damageStats"][
                "totalDamageDone"
            ]
            for frame in frames
        ]
        total_damage_done_to_champions = [
            frame["participantFrames"][paritcipant_id]["damageStats"]["totalDamageDoneToChampions"]
            for frame in frames
        ]
        total_damage_taken = [
            frame["participantFrames"][paritcipant_id]["damageStats"]["totalDamageTaken"]
            for frame in frames
        ]

        level = [
            frame["participantFrames"][paritcipant_id]["level"] for frame in frames
        ]
        xp = [frame["participantFrames"][paritcipant_id]["xp"] for frame in frames]
        jungle_minions_killed = [frame["participantFrames"][paritcipant_id]["jungleMinionsKilled"] for frame in frames]
        minions_killed = [frame["participantFrames"][paritcipant_id]["minionsKilled"] for frame in frames]
        time_enemy_spent_controlled = [frame["participantFrames"][paritcipant_id]["timeEnemySpentControlled"] for frame in frames]


        
        return MapSuggestData(
            position_x=map_replay.position_x[paritcipant_id][0],
            position_y=map_replay.position_y[paritcipant_id][0],
            team_position=player["teamPosition"],
            lane=player["lane"],
            role=player["role"],
            timestamp=map_replay.timestamp,
            prev_x=map_replay.position_x[paritcipant_id][-1],
            prev_y=map_replay.position_y[paritcipant_id][-1],
            prev_prev_x=map_replay.position_x[paritcipant_id][-2],
            prev_prev_y=map_replay.position_x[paritcipant_id][-2],
            champExperience=player["champExperience"],
            champLevel=player["champLevel"],
            championId=player["championId"],
            gameDuration=player["gameDuration"],
            deaths=player.get("deaths", 0),
            itemsPurchased=player.get("itemsPurchased", 0),
            killingSprees=player.get("killingSprees", 0),
            kills=player["kills"],
            visionScore=player.get("visionScore", 0),
            jungleMinionsKilled=jungle_minions_killed,
            level=level,
            minionsKilled=minions_killed,
            timeEnemySpentControlled=time_enemy_spent_controlled,
            xp=xp,
            totalDamageDone=total_damage_done,
            totalDamageDoneToChampions=total_damage_done_to_champions,
            totalDamageTaken=total_damage_taken,
            abilityHaste=ability_haste,
            abilityPower=ability_power,
            armor=armor,
            attackDamage=attack_damage,
            attackSpeed=attack_speed,
            ccReduction=cc_reduction,
            cooldownReduction=cooldown_reduction,
            health=health,
            health_max=health_max,
            health_regen=health_regen,
            lifesteal=lifesteal,
            movementSpeed=movement_speed,
            power=power,
            powerMax=power_max
        )

    @staticmethod
    async def profile_data(match_id: str, puuid: str) -> ProfileData:
        try:
            match = await riot_service.get_match_detail(match_id)

            # cast
            info = match["info"]
            # paticipants filter by puuid
            index = next(
                (
                    i
                    for i, participant in enumerate(info["participants"])
                    if participant["puuid"] == puuid
                ),
                None,
            )
            if index is None:
                raise HTTPException(status_code=404, detail="Participant not found")

            participants = info["participants"][index]

            game_duration_min = info.get("gameDuration", 0) / 60
            gold_earned = participants.get("goldEarned", 0)
            gold_per_minute = (
                gold_earned / game_duration_min if game_duration_min > 0 else 0
            )

            response = ProfileData(
                endOfGameResult=info["endOfGameResult"],
                gameDuration=info["gameDuration"],
                puuid=puuid,
                champExperience=participants.get("champExperience", 0),
                champLevel=participants.get("champLevel", 1),
                goldPerMinute=gold_per_minute,
                kda=(
                    participants.get("challenges", {}).get("kda", 0)
                    if participants.get("challenges")
                    else 0
                ),
                deaths=participants.get("deaths", 0),
                doubleKills=participants.get("doubleKills", 0),
                killingSprees=participants.get("killingSprees", 0),
                largestKillingSpree=participants.get("largestKillingSpree", 0),
                largestMultiKill=participants.get("largestMultiKill", 0),
                playerScore0=participants.get("playerScore0", 0),
                playerScore1=participants.get("playerScore1", 0),
                playerScore2=participants.get("playerScore2", 0),
                playerScore3=participants.get("playerScore3", 0),
                playerScore4=participants.get("playerScore4", 0),
                playerScore5=participants.get("playerScore5", 0),
                playerScore6=participants.get("playerScore6", 0),
                playerScore7=participants.get("playerScore7", 0),
                playerScore8=participants.get("playerScore8", 0),
                playerScore9=participants.get("playerScore9", 0),
                playerScore10=participants.get("playerScore10", 0),
                playerScore11=participants.get("playerScore11", 0),
                pentakills=participants.get("pentaKills", 0),
                quadrakills=participants.get("quadraKills", 0),
                timePlayed=participants.get("timePlayed", 0),
                tripleKills=participants.get("tripleKills", 0),
                unreal=participants.get("unrealKills", 0),
                lane=participants.get("lane", 0),
                kills=participants.get("kills", 0),
                teamPosition=participants.get("teamPosition", 0),
            )
            # might add this later
            # //dpm
            # //creep score
            # //xp
            return response
        except KeyError as e:
            raise HTTPException(
                status_code=500, detail=f"Missing expected Riot API Field: {e}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

    @staticmethod
    async def match_data(match_id: str, puuid: str) -> MatchData:
        try:
            match = await riot_service.get_match_detail(match_id)
            # cast
            info = match["info"]
            # paticipants filter by puuid
            participant_index = next(
                (
                    i
                    for i, participant in enumerate(info["participants"])
                    if participant["puuid"] == puuid
                ),
                None,
            )

            if participant_index is None:
                raise HTTPException(status_code=404, detail="Participant not found")

            participants = info["participants"][participant_index]

            teams = next(
                (t for t in info["teams"] if t["teamId"] == participants["teamId"])
            )
            champion_id: list[int] = []
            pick_turn: list[int] = []

            if teams is None:
                raise HTTPException(
                    status_code=500, detail="Could not get data from Riot API"
                )

            for ban in teams["bans"]:
                champion_id.append(ban.get("championId", 0))
                pick_turn.append(ban["pickTurn"])

            challenges = participants.get("challenges", {})

            def get_challenges(field: str, default: Any = 0):
                return challenges.get(field, default)

            response = MatchData(
                end_of_game_result=info["endOfGameResult"],
                gameDuration=info["gameDuration"],
                gameMode=info["gameMode"],
                gameName=info["gameName"],
                mapId=info["mapId"],
                champExperience=participants["champExperience"],
                champLevel=participants["champLevel"],
                championName=participants["championName"],
                earliestBaron=get_challenges("earliestBaron"),
                earliestDragonTakedown=get_challenges("earliestDragonTakedown", 0),
                earliestElderDragon=get_challenges("earliestElderDragon", 0),
                fastestLegendary=get_challenges("fastestLegendary", 0),
                hadAfkTeammate=get_challenges("hadAfkTeammate", 0),
                highestChampionDamage=get_challenges("highestChampionDamage", 0),
                takedownFirst25Min=get_challenges("takedownFirst25Min", 0),
                teleportTakedowns=get_challenges("teleportTakedowns", 0),
                thirdInhibitorDestroyedTime=get_challenges(
                    "thirdInhibitorDestroyedTime", 0
                ),
                fistBumpTakedowns=get_challenges("fistBumpTakedowns", 0),
                baronTakedowns=get_challenges("baronTakedowns", 0),
                bountyGold=get_challenges("bountyGold", 0),
                damagePerMinute=get_challenges("damagePerMinute", 0),
                deatshByEnemyChamps=get_challenges("deatshByEnemyChamps", 0),
                elderDragonKillsWithOpposingSoul=get_challenges("elderDragonKillsWithOpposingSoul", 0),
                elderDragonMultikill=get_challenges("elderDragonMultikill", 0),
                enemyJungleMonsterKills=get_challenges("enemyJungleMonsterKills", 0),
                firstTurretKilled=get_challenges("firstTurretKilled", False),
                firstTuttetKilledTime=get_challenges("firstTurretKilledTime"),
                gameLength=get_challenges("gameLength"),
                goldPerMinute=get_challenges("goldPerMinute"),
                kda=get_challenges("kda"),
                killingSprees=get_challenges("killingSprees"),
                lostAnInhibitor=get_challenges("lostAnInhibitor"),
                perfectDragonSoulsTaken=get_challenges(
                    "perfectDragonSoulsTaken", False
                ),
                quickFirstTurrentKills=get_challenges("quickFirstTurrentKills"),
                quickSoloKills=get_challenges("quickSoloKills"),
                scuttleCrabKills=get_challenges("scuttleCrabKills"),
                soloBaronKills=get_challenges("soloBaronKills"),
                SWARM_DefeatAatrox=get_challenges("SWARM_DefeatAatrox"),
                SWARM_DefeatBriar=get_challenges("SWARM_DefeatBriar"),
                SWARM_DefeatMiniBosses=get_challenges("SWARM_DefeatMiniBosses"),
                SWARM_EvolveWeapon=get_challenges("SWARM_EvolveWeapon"),
                SWARM_Have3Passives=get_challenges("SWARM_Have3Passives"),
                SWARM_KillEnemy=get_challenges("SWARM_KillEnemy"),
                SWARM_PickupGold=get_challenges("SWARM_PickupGold"),
                SWARM_ReachLevel50=get_challenges("SWARM_ReachLevel50"),
                SWARM_WinWith5EvolvedWeapons=get_challenges(
                    "SWARM_WinWith5EvolvedWeapons"
                ),
                soloKills=get_challenges("soloKills"),
                stealthWardsPlaced=get_challenges("stealthWardsPlaced"),
                takedowns=get_challenges("takedowns"),
                teamBaronKills=get_challenges("teamBaronKills"),
                teamElderDragonKills=get_challenges("teamElderDragonKills"),
                teamRiftHeraldKills=get_challenges("teamRiftHeraldKills"),
                unseenRecalls=get_challenges("unseenRecalls"),
                visionScorePerMinute=get_challenges("visionScorePerMinute"),
                wardTakedowns=get_challenges("wardTakedowns"),
                platformId=info.get("platformId", ""),
                championId=champion_id,
                pickTurn=pick_turn,
                baron_first=teams.get("objectives", {})
                .get("baron", {})
                .get("first", False),
                baron_kills=teams.get("objectives", {})
                .get("baron", {})
                .get("kills", 0),
                champion_first=teams.get("objectives", {})
                .get("champion", {})
                .get("first", False),
                champion_kills=teams.get("objectives", {})
                .get("champion", {})
                .get("kills", 0),
                dragon_first=teams.get("objectives", {})
                .get("dragon", {})
                .get("first", False),
                dragon_kills=teams.get("objectives", {})
                .get("dragon", {})
                .get("kills", 0),
                horde_first=teams.get("objectives", {})
                .get("horde", {})
                .get("first", False),
                horde_kills=teams.get("objectives", {})
                .get("horde", {})
                .get("kills", 0),
                inhibitor_first=teams.get("objectives", {})
                .get("inhibitor", {})
                .get("first", False),
                inhobitor_kills=teams.get("objectives", {})
                .get("inhibitor", {})
                .get("kills", 0),
                riftHerald_first=teams.get("objectives", {})
                .get("riftHerald", {})
                .get("first", False),
                riftherald_kills=teams.get("objectives", {})
                .get("riftHerald", {})
                .get("kills", 0),
                tower_first=teams.get("objectives", {})
                .get("tower", {})
                .get("first", False),
                tower_kills=teams.get("objectives", {})
                .get("tower", {})
                .get("kills", 0),
                teams_teamId=teams.get("teamId", 0),
                teams_win=teams.get("win", False),
            )

            return response
        except HTTPException:
            raise HTTPException(status_code=500, detail=internal_server_error)
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")

    @staticmethod
    async def champion_data(match_id: str, puuid: str) -> ChampionData:
        try:
            match = await riot_service.get_match_detail(match_id)
            timeline = await riot_service.get_match_timeline(match_id)
            info = match["info"]

            participants = info["participants"]

            player_data = next((p for p in participants if p["puuid"] == puuid), None)

            if player_data is None:
                raise HTTPException(
                    status_code=404,
                    detail="User not found in match. Incorrect puuid or matchid",
                )

            champion_ids: list[int] = []
            for p in participants:
                if p["puuid"] != puuid:
                    champion_ids.append(p.get("championId", 0))

            frames = timeline["info"]["frames"]
            paritcipant_id = LiveAnalyticsService.find_participant_id(timeline["info"]["participants"], puuid)

            if paritcipant_id is None:
                raise HTTPException(status_code=404, detail=player_not_found)

            participant_data = LiveAnalyticsService.get_participants_data(frames, paritcipant_id)
            champion_stats_data = LiveAnalyticsService.get_champion_stats(frames, paritcipant_id)
            damage_stats_data = LiveAnalyticsService.get_damage_stats(frames, paritcipant_id)

            response = ChampionData(
                championId=player_data.get("championId", 0),
                teamPosition=player_data.get("teamPosition", 0),
                role=player_data.get("role", ""),
                lane=player_data.get("lane", ""),
                damageDealtToBuildings=player_data.get("damageDealtToBuildings", 0),
                damageDealtToObjectives=player_data.get("damageDealtToObjectives", 0),
                damageDealtToTurrets=player_data.get("damageDealtToTurrets", 0),
                damageSelfMitigated=player_data.get("damageSelfMitigated", 0),
                deaths=player_data.get("deaths", 0),
                inhibitorTakedowns=player_data.get("inhibitorTakedowns", 0),
                inhibitorsLost=player_data.get("inhibitorsLost", 0),
                itemsPurchased=player_data.get("itemsPurchased", 0),
                killingSprees=player_data.get("killingSprees", 0),
                kills=player_data.get("kills", 0),
                totalHeal=player_data.get("totalHeal", 0),
                totalHealsOnTeammates=player_data.get("totalHealsOnTeammates", 0),
                visionScore=player_data.get("visionScore", 0),

                currentGold = participant_data.currentGold,
                goldPerSecond = participant_data.goldPerSecond,
                level = participant_data.level,
                minionsKilled = participant_data.minionsKilled,
                timeEnemySpentControlled = participant_data.timeEnemySpentControlled,
                totalGold = participant_data.totalGold,
                xp = participant_data.xp,

                magicDamageDone = damage_stats_data.magicDamageDone,
                magicDamageDoneToChampions = damage_stats_data.magicDamageDoneToChampions,
                magicDamageTaken =damage_stats_data.magicDamageTaken ,
                physicalDamageDone = damage_stats_data.physicalDamageDone,
                physicalDamageDoneToChampions = damage_stats_data.physicalDamageDoneToChampions,
                physicalDamageTaken = damage_stats_data.physicalDamageTaken,
                totalDamageDone = damage_stats_data.totalDamageDone,
                totalDamageDoneToChampions = damage_stats_data.totalDamageDoneToChampions,
                totalDamageTaken = damage_stats_data.totalDamageTaken,
                trueDamageDone = damage_stats_data.trueDamageDone,
                trueDamageDoneToChampions = damage_stats_data.trueDamageDoneToChampions,
                trueDamageTaken = damage_stats_data.trueDamageTaken,

                abilityPower = champion_stats_data.abilityPower,
                armor = champion_stats_data.armor,
                armorPenPercent = champion_stats_data.armorPenPercent,
                attackDamage =champion_stats_data.attackDamage,
                attackSpeed = champion_stats_data.attackSpeed,
                ccReduction = champion_stats_data.ccReduction,
                health = champion_stats_data.health,
                healthMax = champion_stats_data.healthMax,
                healthRegen = champion_stats_data.healthRegen,
                lifesteal = champion_stats_data.lifesteal,
                magicPen = champion_stats_data.magicPen,
                magicPenPercent = champion_stats_data.magicPenPercent,
                magicResist = champion_stats_data.magicResist,
                movementSpeed = champion_stats_data.movementSpeed,
                omniVamp = champion_stats_data.omnivamp,
                power = champion_stats_data.power,
                powerMax = champion_stats_data.powerMax,            
            )

            return response
        except HTTPException:
            raise HTTPException(status_code=500, detail=internal_server_error)
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")

    @staticmethod
    async def item_data(match_id: str, puuid: str) -> ItemData:
        try:
            timeline = await riot_service.get_match_timeline(match_id)
            match = await riot_service.get_match_detail(match_id)

            frames = timeline["info"]["frames"]

            player = next(
                (p for p in match["info"]["participants"] if p["puuid"] == puuid), None
            )

            if player is None:
                raise HTTPException(status_code=404, detail="Player not found in match")

            participant_id = LiveAnalyticsService.find_participant_id(timeline["info"]["participants"], puuid)

            if participant_id is None:
                raise HTTPException(status_code=404, detail=player_not_found)

            event_timestamp: list[int] = []
            item_id: list[int] = []

            item_events = [
                event
                for frame in frames
                for event in frame["events"]
                if event.get("participantId") == (participant_id)
            ]

            event_timestamp = [event["timestamp"] for event in item_events]
            item_id = [event["itemId"] for event in item_events if "itemId" in event]

            damage_stats_data =  LiveAnalyticsService.get_damage_stats(frames, participant_id)
            champion_stats_data = LiveAnalyticsService.get_champion_stats(frames, participant_id)
            participant_data = LiveAnalyticsService.get_participants_data(frames, participant_id)
            map_replay = await LiveAnalyticsService.map_replay(match_id)
            

            response = ItemData(
                itemId=item_id,
                timestamp=event_timestamp,
                lane=player["lane"],
                champExperience=player["champExperience"],
                champLevel=player["champLevel"],
                championId=player["championId"],
                currentGold=participant_data.currentGold,
                level=participant_data.level,
                minionsKilled=participant_data.minionsKilled,
                timeEnemySpentControlled=participant_data.timeEnemySpentControlled,
                totalGold=participant_data.totalGold,
                xp=participant_data.xp,
                position_x=map_replay.position_x[participant_id][0],
                position_y=map_replay.position_x[participant_id][0],
                magicDamageDone=damage_stats_data.magicDamageDone,
                magicDamageDoneToChampions=damage_stats_data.magicDamageDoneToChampions,
                magicDamageTaken=damage_stats_data.magicDamageTaken,
                physicalDamageDone=damage_stats_data.physicalDamageDone,
                physicalDamageDoneToChampions=damage_stats_data.physicalDamageDoneToChampions,
                physicalDamageTaken=damage_stats_data.physicalDamageTaken,
                totalDamageDone=damage_stats_data.totalDamageDone,
                totalDamageDoneToChampions=damage_stats_data.totalDamageDoneToChampions,
                totalDamageTaken=damage_stats_data.totalDamageTaken,
                trueDamageDone=damage_stats_data.trueDamageDone,
                trueDamageDoneToChampions=damage_stats_data.trueDamageDoneToChampions,
                trueDamageTaken=damage_stats_data.trueDamageTaken,
                abilityPower=champion_stats_data.abilityPower,
                armor=champion_stats_data.armor,
                armorPenPercent=champion_stats_data.armorPenPercent,
                attackDamage=champion_stats_data.attackDamage,
                attackSpeed=champion_stats_data.attackSpeed,
                ccReduction=champion_stats_data.ccReduction,
                health=champion_stats_data.health,
                healthMax=champion_stats_data.healthMax,
                healthRegen=champion_stats_data.healthRegen,
                lifesteal=champion_stats_data.lifesteal,
                magicPen=champion_stats_data.magicPen,
                magicPenPercent=champion_stats_data.magicPenPercent,
                magicResist=champion_stats_data.magicResist,
                movementSpeed=champion_stats_data.movementSpeed,
                omnivamp=champion_stats_data.omnivamp,
                power=champion_stats_data.power,
                powerMax=champion_stats_data.powerMax,
            )

            return response
        except HTTPException:
            raise
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")
        except Exception:
            raise HTTPException(status_code=500, detail=internal_server_error)

    @staticmethod
    async def skill_data(match_id: str, puuid: str) -> SkillData:
        try:
            timeline = await riot_service.get_match_timeline(match_id)
            match = await riot_service.get_match_detail(match_id)

            frames = timeline["info"]["frames"]

            player = next(
                (p for p in match["info"]["participants"] if p["puuid"] == puuid), None
            )

            if player is None:
                raise HTTPException(status_code=404, detail=player_not_found)

            participant_id = str(player["participantId"])

            item_events = [
                event
                for frame in frames
                for event in frame["events"]
                if event.get("participantId") == int(participant_id)
            ]

            event_timestamp = [event["timestamp"] for event in item_events]
            skill_events = [
                event for event in item_events if event["type"] == "SKILL_LEVEL_UP"
            ]

            skill_slot = [event["skillSlot"] for event in skill_events]
            level_up_type = [event["levelUpType"] for event in skill_events]

            level = [
                frame["participantFrames"][participant_id]["level"] for frame in frames
            ]

            magic_damage_done = [
                frame["participantFrames"][participant_id]["damageStats"][
                    "magicDamageDone"
                ]
                for frame in frames
            ]
            physical_damage_done = [
                frame["participantFrames"][participant_id]["damageStats"][
                    "physicalDamageDone"
                ]
                for frame in frames
            ]
            total_damage_done = [
                frame["participantFrames"][participant_id]["damageStats"][
                    "totalDamageDone"
                ]
                for frame in frames
            ]
            armor = [
                frame["participantFrames"][participant_id]["championStats"]["armor"]
                for frame in frames
            ]
            attack_damage = [
                frame["participantFrames"][participant_id]["championStats"][
                    "attackDamage"
                ]
                for frame in frames
            ]
            attack_speed = [
                frame["participantFrames"][participant_id]["championStats"][
                    "attackSpeed"
                ]
                for frame in frames
            ]
            health = [
                frame["participantFrames"][participant_id]["championStats"]["health"]
                for frame in frames
            ]
            health_max = [
                frame["participantFrames"][participant_id]["championStats"]["healthMax"]
                for frame in frames
            ]
            movement_speed = [
                frame["participantFrames"][participant_id]["championStats"][
                    "movementSpeed"
                ]
                for frame in frames
            ]
            power = [
                frame["participantFrames"][participant_id]["championStats"]["power"]
                for frame in frames
            ]

            participants_data = LiveAnalyticsService.get_participants_data(frames, (participant_id))
            champion_stats_data = LiveAnalyticsService.get_champion_stats(frames, (participant_id))
            damage_stats_data = LiveAnalyticsService.get_damage_stats(frames, (participant_id))
            map_replay: MapReplay = await LiveAnalyticsService.map_replay(match_id)
            response = SkillData(
                skillslot=skill_slot,
                levelUpType=level_up_type,
                timestamp=event_timestamp,
                championId=player["championId"],
                damageSelfMitigated=player.get("damageSelfMitigated", 0),
                deaths=player.get("deaths", 0),
                kills=player.get("kills", 0),
                totalHeal=player.get("totalHeal", 0),
                level=level,
                timeEnemySpentControlled=participants_data.timeEnemySpentControlled,
                totalGold=participants_data.totalGold,
                xp=participants_data.xp,
                position_x=map_replay.position_x[participant_id],
                position_y=map_replay.position_y[participant_id],
                magicDamageDone=magic_damage_done,
                physicalDamageDone=physical_damage_done,
                totalDamageDone=total_damage_done,
                totalDamageDoneToChampions=damage_stats_data.totalDamageDoneToChampions,
                totalDamageTaken=damage_stats_data.totalDamageTaken,
                armor=armor,
                attackDamage=attack_damage,
                attackSpeed=attack_speed,
                health=health,
                healthMax=health_max,
                movementSpeed=movement_speed,
                power=power,
                powerMax=champion_stats_data.powerMax
            )

            return response
        except HTTPException:
            raise
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")
        except Exception:
            raise HTTPException(status_code=500, detail=internal_server_error)

    @staticmethod
    async def role_data(match_id: str, puuid: str) -> RoleData:
        try:
            timeline = await riot_service.get_match_timeline(match_id)
            match = await riot_service.get_match_detail(match_id)

            frames = timeline["info"]["frames"]

            player = next(
                (p for p in match["info"]["participants"] if p["puuid"] == puuid), None
            )

            if player is None:
                raise HTTPException(status_code=404, detail="Player not found in match")

            participant_id = str(player["participantId"])
            start_frame = frames[0]
            end_frame = frames[-1]

            start_stats = start_frame["participantFrames"][participant_id][
                "championStats"
            ]
            end_stats = end_frame["participantFrames"][participant_id]["championStats"]

            start_movement_speed = start_stats.get("movementSpeed", 0)
            start_health = start_stats.get("health", 0)
            start_health_max = start_stats.get("healthMax", 0)
            start_health_regen = start_stats.get("healthRegen", 0)
            start_armor = start_stats.get("armor", 0)
            end_movement_speed = end_stats.get("movementSpeed", 0)
            end_health = end_stats.get("health", 0)
            end_health_max = end_stats.get("healthMax", 0)
            end_health_regen = end_stats.get("healthRegen", 0)
            end_armor = end_stats.get("armor", 0)

            response = RoleData(
                teamPosition=player.get("teamPosition", ""),
                lane=player.get("lane", ""),
                championId=player.get("championId", 0),
                kills=player.get("kills", 0),
                physicalDamageDealt=player.get("physicalDamageDealt", 0),
                totalDamageDealt=player.get("totalDamageDealt", 0),
                magicDamageDealt=player.get("magicDamageDealt", 0),
                totalHeal=player.get("totalHeal", 0),
                totalEnemyJungleMinionsKilled=player.get(
                    "totalEnemyJungleMinionsKilled", 0
                ),
                totalHealsOnTeammates=player.get("totalHealsOnTeammates", 0),
                totalUnitsHealed=player.get("totalUnitsHealed", 0),
                wardsKilled=player.get("wardsKilled", 0),
                wardsPlaced=player.get("wardsPlaced", 0),
                detectorWardsPlaced=player.get("detectorWardsPlaced", 0),
                start_movementSpeed=start_movement_speed,
                start_health=start_health,
                start_healthMax=start_health_max,
                start_healthRegen=start_health_regen,
                start_armor=start_armor,
                end_movementSpeed=end_movement_speed,
                end_health=end_health,
                end_healthMax=end_health_max,
                end_healthRegen=end_health_regen,
                end_armor=end_armor,
            )

            return response
        except HTTPException:
            raise
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Internal server error {str(e)}"
            )
