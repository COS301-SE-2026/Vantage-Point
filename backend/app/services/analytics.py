import asyncio
from typing import Any
from app.Models.profile_schemas import LiveAdvancedMetrics
from app.Models.riot_schemas import (MapReplay, MapSuggestData, ProfileData, MatchData, ChampionData, ItemData, SkillData)
from app.services.riot_service import riot_service
from fastapi import HTTPException


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

    # at the moment only the user hence we need the puuid in the the method call as paramater, otherwise no way to know which user you are. Might add it
    # to a env and then just update it when the user changes his/her puuid they are using. Don't have to call/put it in each time
    # added data param for incase I do not have to do the call again only once pass it in and then check and use it if possible
    async def map_replay(
        self, match_id: str, puuid: str | None = None, data: MapReplay | None = None
    ) -> MapReplay:
        if data is None:
            _data: Any = await riot_service.get_match_timeline(match_id)
        else:
            _data = data

        x_values: dict[str, list[int]] = {}
        y_values: dict[str, list[int]] = {}
        frames = _data["info"]["frames"]

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
            timestamp=_data["info"]["frames"]["timestamp"],
            position_x=x_values,
            position_y=y_values,
        )

    async def map_suggest_data(self, match_id: str) -> MapSuggestData:
        timeline = await riot_service.get_match_timeline(match_id)
        match = await riot_service.get_match_detail(match_id)
        # cover part of knn required data
        map_replay: MapReplay = await self.map_replay(timeline)

        armor: dict[str, list[int]] = {}
        attack_damage: dict[str, list[int]] = {}
        attack_speed: dict[str, list[int]] = {}
        health: dict[str, list[int]] = {}
        health_max: dict[str, list[int]] = {}
        health_regen: dict[str, list[int]] = {}
        true_damage_done: dict[str, list[int]] = {}
        true_damage_done_to_champions: dict[str, list[int]] = {}
        true_damage_taken: dict[str, list[int]] = {}
        gold_per_second: dict[str, list[int]] = {}
        level: dict[str, list[int]] = {}
        xp: dict[str, list[int]] = {}
        frames = timeline["info"]["frames"]

        for i in range(1, 10):
            armor[str(i)] = [
                frame["participantFrames"][str(i)]["championStats"]["armor"]
                for frame in frames
            ]
            attack_damage[str(i)] = [
                frame["participantFrames"][str(i)]["championStats"]["attackDamage"]
                for frame in frames
            ]
            attack_speed[str(i)] = [
                frame["participantFrames"][str(i)]["championStats"]["attackSpeed"]
                for frame in frames
            ]
            health[str(i)] = [
                frame["participantFrames"][str(i)]["championStats"]["health"]
                for frame in frames
            ]
            health_max[str(i)] = [
                frame["participantFrames"][str(i)]["championStats"]["healthMax"]
                for frame in frames
            ]
            health_regen[str(i)] = [
                frame["participantFrames"][str(i)]["championStats"]["healthRegen"]
                for frame in frames
            ]
            true_damage_done[str(i)] = [
                frame["participantFrames"][str(i)]["damageStats"]["trueDamageDone"]
                for frame in frames
            ]
            true_damage_done_to_champions[str(i)] = [
                frame["participantFrames"][str(i)]["damageStats"][
                    "trueDamageDoneToChampions"
                ]
                for frame in frames
            ]
            true_damage_taken[str(i)] = [
                frame["participantFrames"][str(i)]["damageStats"]["trueDamageTaken"]
                for frame in frames
            ]
            gold_per_second[str(i)] = [
                frame["participantFrames"][str(i)]["goldPerSecond"] for frame in frames
            ]
            level[str(i)] = [
                frame["participantFrames"][str(i)]["level"] for frame in frames
            ]
            xp[str(i)] = [frame["participantFrames"][str(i)]["xp"] for frame in frames]

        return MapSuggestData(
            map_replay=map_replay,
            end_of_game_result=match["info"]["endOfGameResult"],
            armor=armor,
            attack_damage=attack_damage,
            attack_speed=attack_speed,
            health=health,
            health_max=health_max,
            health_regen=health_regen,
            champion_id=[
                p["championId"] for p in match["info"]["participants"]["championId"]
            ],
            true_damage_done=true_damage_done,
            true_damage_done_to_champion=true_damage_done_to_champions,
            true_damage_taken=true_damage_taken,
            gold_per_second=gold_per_second,
            level=level,
            xp=xp,
            team_position=[
                p["teamPosition"] for p in match["info"]["participants"]["championId"]
            ],
            lane=[p["lane"] for p in match["info"]["participants"]["championId"]],
        )

    async def profile_data(self, match_id: str, puuid: str) -> ProfileData:
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

            response = ProfileData(
                endOfGameResult=info["endOfGameResult"],
                gameDuration=info["gameDuration"],
                puuid=puuid,
                champExperience=participants["champExperience"],
                champLevel=participants["champLevel"],
                goldPerMinute=12,
                kda=participants["challenges"]["kda"],
                deaths=participants["deaths"],
                doubleKills=participants["doubleKills"],
                killingSprees=participants["killingSprees"],
                largestKillingSpree=participants["largestKillingSpree"],
                largestMultiKill=participants["largestMultiKill"],
                playerScore0=participants["playerScore0"],
                playerScore1=participants["playerScore1"],
                playerScore2=participants["playerScore2"],
                playerScore3=participants["playerScore3"],
                playerScore4=participants["playerScore4"],
                playerScore5=participants["playerScore5"],
                playerScore6=participants["playerScore6"],
                playerScore7=participants["playerScore7"],
                playerScore8=participants["playerScore8"],
                playerScore9=participants["playerScore9"],
                playerScore10=participants["playerScore10"],
                playerScore11=participants["playerScore11"],
                pentakills=participants["pentaKills"],
                quadrakills=participants["quadraKills"],
                timePlayed=participants["timePlayed"],
                tripleKills=participants["tripleKills"],
                unreal=participants["unrealKills"],
                lane=participants["lane"],
                kills=participants["kills"],
                teamPosition=participants["teamPosition"],
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

    async def match_data(self, match_id: str, puuid: str) -> MatchData:
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

            response = MatchData(
                end_of_game_result=info["endOfGameResult"],
                gameDuration=info["gameDuration"],
                gameMode=info["gameMode"],
                gameName=info["gameName"],
                mapId=info["mapId"],
                champExperience=participants["champExperience"],
                champLevel=participants["champLevel"],
                championName=participants["championName"],
                earliestBaron=participants["challenges"]["earliestBaron"],
                earliestDragonTakedown=participants["challenges"][
                    "earliestDragonTakedown"
                ],
                earliestElderDragon=participants["challenges"]["earliestElderDragon"],
                fastestLegendary=participants["challenges"]["fastestLegendary"],
                highestChampionDamage=participants["challenges"][
                    "highestChampionDamage"
                ],
                takedownFirst25Min=participants["challenges"]["takedownFirst25Min"],
                teleportTakedowns=participants["challenges"]["teleportTakedowns"],
                thirdInhibitorDestroyedTime=participants["challenges"][
                    "thirdInhibitorDestroyedTime"
                ],
                fistBumpTakedowns=participants["challenges"]["fistBumpTakedowns"],
                baronTakedowns=participants["challenges"]["baronTakedowns"],
                bountyGold=participants["challenges"]["bountyGold"],
                damagePerMinute=participants["challenges"]["damagePerMinute"],
                deatshByEnemyChamps=participants["challenges"]["deatshByEnemyChamps"],
                elderDragonMultikill=participants["challenges"]["elderDragonMultikill"],
                enemyJungleMonsterKills=participants["challenges"][
                    "enemyJungleMonsterKills"
                ],
                firstTurretKilled=participants["challenges"]["firstTurretKilled"],
                firstTuttetKilledTime=participants["challenges"][
                    "firstTuttetKilledTime"
                ],
                gameLength=participants["challenges"]["gameLength"],
                goldPerMinute=participants["challenges"]["goldPerMinute"],
                kda=participants["challenges"]["kda"],
                killingSprees=participants["challenges"]["killingSprees"],
                lostAnInhibitor=participants["challenges"]["lostAnInhibitor"],
                perfectDragonSoulsTaken=participants["challenges"][
                    "perfectDragonSoulsTaken"
                ],
                quickFirstTurrentKills=participants["challenges"][
                    "quickFirstTurrentKills"
                ],
                quickSoloKills=participants["challenges"]["quickSoloKills"],
                scuttleCrabKills=participants["challenges"]["scuttleCrabKills"],
                soloBaronKills=participants["challenges"]["soloBaronKills"],
                SWARM_DefeatAatrox=participants["challenges"]["SWARM_DefeatAatrox"],
                SWARM_DefeatBriar=participants["challenges"]["SWARM_DefeatBriar"],
                SWARM_DefeatMiniBosses=participants["challenges"][
                    "SWARM_DefeatMiniBosses"
                ],
                SWARM_EvolveWeapon=participants["challenges"]["SWARM_EvolveWeapon"],
                SWARM_Have3Passives=participants["challenges"]["SWARM_Have3Passives"],
                SWARM_KillEnemy=participants["challenges"]["SWARM_KillEnemy"],
                SWARM_PickupGold=participants["challenges"]["SWARM_PickupGold"],
                SWARM_ReachLevel50=participants["challenges"]["SWARM_ReachLevel50"],
                SWARM_WinWith5EvolvedWeapons=participants["challenges"][
                    "SWARM_WinWith5EvolvedWeapons"
                ],
                soloKills=participants["challenges"]["soloKills"],
                stealthWardsPlaced=participants["challenges"]["stealthWardsPlaced"],
                takedowns=participants["challenges"]["takedowns"],
                teamBaronKills=participants["challenges"]["teamBaronKills"],
                teamElderDragonKills=participants["challenges"]["teamElderDragonKills"],
                teamRiftHeraldKills=participants["challenges"]["teamRiftHeraldKills"],
                unseenRecalls=participants["challenges"]["unseenRecalls"],
                visionScorePerMinute=participants["challenges"]["visionScorePerMinute"],
                wardTakedowns=participants["challenges"]["wardTakedowns"],
                platformId=info["platformId"],
                championId=champion_id,
                pickTurn=pick_turn,
                baron_first=teams["objectives"]["baron"]["first"],
                baron_kills=teams["objectives"]["baron"]["kills"],
                champion_first=teams["objectives"]["champion"]["first"],
                champion_kills=teams["objectives"]["champion"]["kills"],
                dragon_first=teams["objectives"]["dragon"]["first"],
                dragon_kills=teams["objectives"]["dragon"]["kills"],
                horde_first=teams["objectives"]["horde"]["first"],
                horde_kills=teams["objectives"]["horde"]["kills"],
                inhibitor_first=teams["objectives"]["inhibitor"]["first"],
                inhobitor_kills=teams["objectives"]["inhibitor"]["kills"],
                riftHerald_first=teams["objectives"]["riftHerald"]["first"],
                riftherald_kills=teams["objectives"]["riftHerald"]["kills"],
                tower_first=teams["objectives"]["tower"]["first"],
                tower_kills=teams["objectives"]["tower"]["kills"],
                teams_teamId=teams["teamId"],
                teams_win=teams["win"],
            )

            return response
        except HTTPException:
            raise HTTPException(status_code=500, detail="Internal server error")
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")

    async def champion_data(self, match_id: str, puuid: str) -> ChampionData:
        try:
            match = await riot_service.get_match_detail(match_id)
            info = match["info"]

            participants = info["participants"]

            player_data = next(
                (p for p in participants if p["puuid"] == puuid), 
                None
            )

            if player_data is None:
                raise HTTPException(status_code=404,detail="User not found in match. Incorrect puuid or matchid")
            
            champion_ids: list[int] = []
            for p in participants:
                if (p["puuid"] != puuid):
                    champion_ids.append(p["championId"])

            response = ChampionData(
                championId=player_data["championId"],
                teamPosition=player_data["teamPostion"],
                roles=player_data["role"],
                lane=player_data["lane"],
                participants_championId=champion_ids
            )

            return response
        except HTTPException:
            raise HTTPException(status_code=500, detail="Internal server error")
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")

    async def item_data(self, match_id: str, puuid: str) -> ItemData:
        try:
            timeline = await riot_service.get_match_timeline(match_id)
            match = await riot_service.get_match_detail(match_id)

            frames = timeline["info"]["frames"]

            player = next(
                (p for p in match["info"]["participants"] if p["puuid"] == puuid),
                None
            )

            if player is None:
                raise HTTPException(status_code=404, detail="Player not found in match")
            
            participant_id = str(player["participantId"])

            currentGold = {}
            level = {}
            xp = {}
            totalDamageDone = {}
            totalDamageTaken = {}
            health = {}
            healthMax = {}
            healthRegen = {}
            lifesteal = {}
            power = {}
            powerMax = {}
            armor = {}

            currentGold = [
                frame["participantFrames"][participant_id]["currentGold"] for frame in frames
            ]
            level = [
                frame["participantFrames"][participant_id]["level"] for frame in frames
            ]
            xp = [
                frame["participantFrames"][participant_id]["xp"] for frame in frames
            ]
            totalDamageDone = [
                frame["participantFrames"][participant_id]["damageStats"]["totalDamageDone"] for frame in frames
            ]
            totalDamageTaken = [
                frame["participantFrames"][participant_id]["damageStats"]["totalDamageTaken"] for frame in frames
            ]
            health = [
                frame["participantFrames"][participant_id]["championStats"]["health"] for frame in frames
            ]
            healthMax = [
                frame["participantFrames"][participant_id]["championStats"]["healthMax"] for frame in frames
            ]
            healthRegen = [
                frame["participantFrames"][participant_id]["championStats"]["healthRegen"] for frame in frames
            ]
            lifesteal = [
                frame["participantFrames"][participant_id]["championStats"]["lifesteal"] for frame in frames
            ]
            power = [
                frame["participantFrames"][participant_id]["championStats"]["power"] for frame in frames
            ]
            powerMax = [
                frame["participantFrames"][participant_id]["championStats"]["powerMax"] for frame in frames
            ]
            armor = [
                frame["participantFrames"][participant_id]["championStats"]["armor"] for frame in frames
            ]
            
            event_timestamp = {}
            item_id = {}

            item_events = [event for frame in frames for event in frame["events"]
                           if event.get("participantId") == int(participant_id)]
            
            event_timestamp = [event["timestamp"] for event in item_events]
            item_id = [event["itemId"] for event in item_events
                       if "itemId" in event]

            response = ItemData(
                itemId=item_id,
                timestamp=event_timestamp,
                championId=player["championId"],
                champLevel=player["champLevel"],
                currentGold=currentGold,
                level=level,
                xp=xp,
                damageStats_totalDamageDone=totalDamageDone,
                damageStats_totalDamageTaken=totalDamageTaken,
                championStats_health=health,
                championStats_healthMax=healthMax,
                championStats_healthRegen=healthRegen,
                championStats_lifesteal=lifesteal,
                championStats_power=power,
                championStats_powerMax=powerMax,
                championStats_armor=armor,
            )

            return response
        except HTTPException:
                raise
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")
        except Exception:
                raise HTTPException(status_code=500, detail="Internal server error") 
                              
    async def skill_data(self, match_id: str, puuid: str) -> SkillData:          
        try:
            timeline = await riot_service.get_match_timeline(match_id)
            match = await riot_service.get_match_detail(match_id)

            frames = timeline["info"]["frames"]

            player = next(
                (p for p in match["info"]["participants"] if p["puuid"] == puuid),
                None
            )

            if player is None:
                raise HTTPException(status_code=404, detail="Player not found in match")
            
            participant_id = str(player["participantId"])

            item_events = [event for frame in frames for event in frame["events"]
                           if event.get("participantId") == int(participant_id)]
            
            event_timestamp = [event["timestamp"] for event in item_events]
            skill_events = [event for event in item_events
                            if event["type"] == "SKILL_LEVEL_UP"]
            
            skill_slot = [event["skillSlot"] for event in skill_events]
            level_up_type = [event["levelUpType"] for event in skill_events]
            
            level = [
                frame["participantFrames"][participant_id]["level"]
                for frame in frames
            ]
            
            goldPerSecond = [
                frame["participantFrames"][participant_id]["goldPerSecond"] for frame in frames
            ]
            magicDamageDone = [
                frame["participantFrames"][participant_id]["damageStats"]["magicDamageDone"] for frame in frames
            ]
            physicalDamageDone = [
                frame["participantFrames"][participant_id]["damageStats"]["physicalDamageDone"] for frame in frames
            ]
            totalDamageDone = [
                frame["participantFrames"][participant_id]["damageStats"]["totalDamageDone"] for frame in frames
            ]
            abilityHaste = [
                frame["participantFrames"][participant_id]["championStats"]["abilityHaste"] for frame in frames
            ]
            armor = [
                frame["participantFrames"][participant_id]["championStats"]["armor"] for frame in frames
            ]
            attackDamage = [
                frame["participantFrames"][participant_id]["championStats"]["attackDamage"] for frame in frames
            ]
            attackSpeed = [
                frame["participantFrames"][participant_id]["championStats"]["attackSpeed"] for frame in frames
            ]
            cooldownReduction = [
                frame["participantFrames"][participant_id]["championStats"]["cooldownReduction"] for frame in frames
            ]
            health = [
                frame["participantFrames"][participant_id]["championStats"]["health"] for frame in frames
            ]
            healthMax = [
                frame["participantFrames"][participant_id]["championStats"]["healthMax"] for frame in frames
            ]
            healthRegen = [
                frame["participantFrames"][participant_id]["championStats"]["healthRegen"] for frame in frames
            ]
            lifesteal = [
                frame["participantFrames"][participant_id]["championStats"]["lifesteal"] for frame in frames
            ]
            movementSpeed = [
                frame["participantFrames"][participant_id]["championStats"]["movementSpeed"] for frame in frames
            ]
            power = [
                frame["participantFrames"][participant_id]["championStats"]["power"] for frame in frames
            ]
            magicPen = [
                frame["participantFrames"][participant_id]["championStats"]["magicPen"] for frame in frames
            ]

            response = SkillData(
                skillslot=skill_slot,
                levelUpType=level_up_type,
                timestamp=event_timestamp,
                level=level,
                championId=player["championId"],
                goldPerSecond=goldPerSecond,
                damageStats_magicDamageDone=magicDamageDone,
                damageStats_physicalDamageDone=physicalDamageDone,
                damageStats_totalDamageDone=totalDamageDone,
                championStats_abilityHaste=abilityHaste,
                championStats_armor=armor,
                championStats_attackDamage=attackDamage,
                championStats_attackSpeed=attackSpeed,
                championStats_cooldownReduction=cooldownReduction,
                championStats_health=health,
                championStats_healthMax=healthMax,
                championStats_healthRegen=healthRegen,
                championStats_lifesteal=lifesteal,
                championStats_movementSpeed=movementSpeed,
                championStats_power=power,
                championStats_magicPen=magicPen
            )

            return response
        except HTTPException:
                raise
        except KeyError as e:
            raise HTTPException(status_code=500, detail=f"Missing Riot API field: {e}")
        except Exception:
                raise HTTPException(status_code=500, detail="Internal server error")

    async def role_data(self, match_id: str, puuid: str) -> Any: 
        try:
            timeline = await riot_service.get_match_timeline(match_id)
            match = await riot_service.get_match_detail(match_id)

            frames = timeline["info"]["frames"]

            player = next(
                (p for p in match["info"]["participants"] if p["puuid"] == puuid),
                None
            )

            if player is None:
                raise HTTPException(status_code=404, detail="Player not found in match")

            participant_id = str(player["participantId"])
            start_frame = frames[0]
            end_frame = frames[-1]

            start_stats = start_frame["participantFrames"][participant_id]["championStats"]
            end_stats = end_frame["participantFrames"][participant_id]["championStats"]

            start_movementSpeed = start_frame["movementSpeed"]
            start_health = start_frame["health"]
            start_healthMax = start_frame["healthMax"]
            start_healthRegen = start_frame["healthRegen"]
            start_armor = start_frame["armor"]
            end_movementSpeed = end_frame["movementSpeed"]
            end_health = end_frame["health"]
            end_healthMax = end_frame["healthMax"]
            end_healthRegen = end_frame["healthRegen"]
            end_armor = end_frame["armor"]


