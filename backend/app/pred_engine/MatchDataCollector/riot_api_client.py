import asyncio
import datetime
import csv
import os
#added to installs aiohttp-3.14.1 aiolimiter-1.2.1
from aiohttp import ClientSession
from aiolimiter import AsyncLimiter

###############################################################################
# 1. CONFIGURATION - EDIT THESE VALUES
###############################################################################
RIOT_API_KEY = "" # https://developer.riotgames.com/
MATCH_REGION_BASE_URL = "https://asia.api.riotgames.com"  # e.g. "https://americas.api.riotgames.com", "https://asia.api.riotgames.com", "https://europe.api.riotgames.com" 
BASE_DOMAIN = "kr.api.riotgames.com"   # e.g. "na1.api.riotgames.com", "euw1.api.riotgames.com", etc.

CHUNK_SIZE = 200000         # Every how many rows we create a NEW CSV file
MAX_ROWS = 10      # How many total rows we want to fetch
MATCH_HISTORY_COUNT = 30  # How many matches to fetch per PUUID

# Replace with the PUUID you want to start from:
INITIAL_PUUID = "gf5s9szyePziDLDV2a9Ntn8LqYvYI0StFWUnX7cTtBTjZvqhsU_9KB-XQdhEKVBeCeEtIty467jfCQ" # https://developer.riotgames.com/apis#account-v1/GET_getByRiotId

# Asynchronous limit to ~15 RPS (avoid console spam and hitting rate limits)
RATE_LIMIT = AsyncLimiter(15, 1.0)

HEADERS = {
    "X-Riot-Token": RIOT_API_KEY
}

PLATFORM_MAP = {
    "EUW1": "euw1.api.riotgames.com",
    "EUN1": "eun1.api.riotgames.com",
    "NA1":  "na1.api.riotgames.com",
    "KR":   "kr.api.riotgames.com",
    "TR1":  "tr1.api.riotgames.com",
    "RU":   "ru.api.riotgames.com",
    "BR1":  "br1.api.riotgames.com",
    "LA1":  "la1.api.riotgames.com",
    "LA2":  "la2.api.riotgames.com",
    "OC1":  "oc1.api.riotgames.com",
}

###############################################################################
# 2. CACHE
###############################################################################
match_details_cache = {}
match_timeline_cache = {}
summoner_rank_cache = {}
champion_mastery_cache = {}

###############################################################################
# 3. do_request - asynchronous HTTP request
###############################################################################
async def do_request(session: ClientSession, url: str, method="GET", params=None, headers=None, retries=0, max_retries=5):
    """
    Asynchronous HTTP request with RPS limit (AsyncLimiter),
    handling 429 and 5xx errors.
    """
    if headers is None:
        headers = {}
    if retries > max_retries:
        print(f"[ERROR] Exceeded max retries limit ({max_retries}) for URL: {url}")
        return None

    async with RATE_LIMIT:
        try:
            if method == "GET":
                resp = await session.get(url, params=params, headers=headers)
            else:
                resp = await session.request(method, url, params=params, headers=headers)
        except Exception as e:
            print(f"[WARN] Exception {e} (URL: {url}) - retrying in 2s...")
            await asyncio.sleep(2)
            return await do_request(session, url, method, params, headers, retries=retries+1)

    if resp.status == 200:
        return resp
    elif resp.status == 429:
        retry_after = int(resp.headers.get("Retry-After", 1))
        print(f"[429] Rate limit reached. Waiting {retry_after}s (URL: {url})")
        await asyncio.sleep(retry_after)
        return await do_request(session, url, method, params, headers, retries=retries+1)
    elif resp.status in [500, 502, 503, 504]:
        print(f"[{resp.status}] Server error. Waiting 5s (URL: {url})")
        await asyncio.sleep(5)
        return await do_request(session, url, method, params, headers, retries=retries+1)
    else:
        text = await resp.text()
        print(f"[{resp.status}] {text} (URL: {url})")
        return None

###############################################################################
# 4. FUNCTIONS FOR DATA FETCHING
###############################################################################
async def get_match_history(session, puuid, count=MATCH_HISTORY_COUNT):
    url = f"{MATCH_REGION_BASE_URL}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"count": count}
    resp = await do_request(session, url, "GET", params=params, headers=HEADERS)
    if resp:
        return await resp.json()
    return []

async def get_match_details(session, match_id):
    if match_id in match_details_cache:
        return match_details_cache[match_id]

    url = f"{MATCH_REGION_BASE_URL}/lol/match/v5/matches/{match_id}"
    resp = await do_request(session, url, "GET", headers=HEADERS)
    if resp:
        data = await resp.json()
        match_details_cache[match_id] = data
        return data
    return None

async def get_match_timeline(session, match_id):
    if match_id in match_timeline_cache:
        return match_timeline_cache[match_id]

    url = f"{MATCH_REGION_BASE_URL}/lol/match/v5/matches/{match_id}/timeline"
    resp = await do_request(session, url, "GET", headers=HEADERS)
    if resp:
        data = await resp.json()
        match_timeline_cache[match_id] = data
        return data
    return None

async def get_summoner_rank(session, puuid, platform_id):
    if not puuid or not platform_id:
        return {}
    cache_key = f"{platform_id}:{puuid}"
    if cache_key in summoner_rank_cache:
        return summoner_rank_cache[cache_key]

    base_domain = PLATFORM_MAP.get(platform_id.upper(), BASE_DOMAIN)
    url = f"https://{base_domain}/lol/league/v4/entries/by-puuid/{puuid}"
    resp = await do_request(session, url, "GET", headers=HEADERS)

    rank_info = {
        "solo_tier": None, "solo_rank": None, "solo_lp": None,
        "solo_wins": None, "solo_losses": None,
        "flex_tier": None, "flex_rank": None, "flex_lp": None,
        "flex_wins": None, "flex_losses": None,
    }
    if resp:
        data = await resp.json()
        for entry in data:
            q_type = entry.get("queueType")
            if q_type == "RANKED_SOLO_5x5":
                rank_info["solo_tier"] = entry.get("tier")
                rank_info["solo_rank"] = entry.get("rank")
                rank_info["solo_lp"]   = entry.get("leaguePoints")
                rank_info["solo_wins"] = entry.get("wins")
                rank_info["solo_losses"] = entry.get("losses")
            elif q_type == "RANKED_FLEX_SR":
                rank_info["flex_tier"] = entry.get("tier")
                rank_info["flex_rank"] = entry.get("rank")
                rank_info["flex_lp"]   = entry.get("leaguePoints")
                rank_info["flex_wins"] = entry.get("wins")
                rank_info["flex_losses"] = entry.get("losses")

    summoner_rank_cache[cache_key] = rank_info
    return rank_info

async def get_champion_mastery(session, puuid, champion_id):
    if not puuid or champion_id is None:
        return {
            "champion_mastery_level": None,
            "champion_mastery_points": None,
            "champion_mastery_lastPlayTime": None,
            "champion_mastery_pointsSinceLastLevel": None,
            "champion_mastery_pointsUntilNextLevel": None,
            "champion_mastery_tokensEarned": None,
        }

    if puuid not in champion_mastery_cache:
        url = f"https://{BASE_DOMAIN}/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}"
        resp = await do_request(session, url, "GET", headers=HEADERS)
        mastery_dict = {}
        if resp:
            mastery_list = await resp.json()
            for item in mastery_list:
                c_id = item.get("championId")
                mastery_dict[c_id] = {
                    "champion_mastery_level": item.get("championLevel"),
                    "champion_mastery_points": item.get("championPoints"),
                    "champion_mastery_lastPlayTime": item.get("lastPlayTime"),
                    "champion_mastery_pointsSinceLastLevel": item.get("championPointsSinceLastLevel"),
                    "champion_mastery_pointsUntilNextLevel": item.get("championPointsUntilNextLevel"),
                    "champion_mastery_tokensEarned": item.get("tokensEarned"),
                }
        champion_mastery_cache[puuid] = mastery_dict

    return champion_mastery_cache[puuid].get(champion_id, {
        "champion_mastery_level": None,
        "champion_mastery_points": None,
        "champion_mastery_lastPlayTime": None,
        "champion_mastery_pointsSinceLastLevel": None,
        "champion_mastery_pointsUntilNextLevel": None,
        "champion_mastery_tokensEarned": None,
    })

###############################################################################
# 5. FINAL CHAMPION STATS
###############################################################################
def get_final_champion_stats(timeline_data, participant_id):
    result = {}
    if not timeline_data:
        return result

    info = timeline_data.get("info", {})
    frames = info.get("frames", [])
    if not frames:
        return result

    last_frame = frames[-1]
    participant_frames = last_frame.get("participantFrames", {})
    p_key = str(participant_id)
    frame_data = participant_frames.get(p_key, {})
    champ_stats = frame_data.get("championStats", {})

    for field in [
        "abilityHaste","abilityPower","armor","armorPen","armorPenPercent",
        "attackDamage","attackSpeed","bonusArmorPenPercent","bonusMagicPenPercent",
        "ccReduction","cooldownReduction","health","healthMax","healthRegen",
        "lifesteal","magicPen","magicPenPercent","magicResist","movementSpeed",
        "omnivamp","physicalVamp","power","powerMax","powerRegen","spellVamp"
    ]:
        val = champ_stats.get(field, None)
        result[f"final_{field}"] = val
    return result

###############################################################################
# 6. DATA PROCESSING
###############################################################################
async def process_match_data(session, match_data, timeline_data, puuid_pool):
    if not match_data:
        return []

    info = match_data["info"]
    participants = info.get("participants", [])
    #platform_id = info.get("platformId")

    #keep_game_id = info.get("gameId")
    keep_game_duration = info.get("gameDuration")
    keep_game_mode = info.get("gameMode")
    keep_game_type = info.get("gameType")
    #keep_game_version = info.get("gameVersion")
    keep_map_id = info.get("mapId")
    #keep_queue_id = info.get("queueId")

    timestamp_ms = info.get("gameStartTimestamp")
    if timestamp_ms:
        dt_utc = datetime.datetime.utcfromtimestamp(timestamp_ms / 1000.0)
        game_start_utc = dt_utc.isoformat() + "Z"
    else:
        game_start_utc = None

    timeInfo = timeline_data["info"]

    rows = []
    for part in participants:
        p = part.get("puuid")
        if p:
            puuid_pool.add(p)

        summoner_id = part.get("summonerId")
        #rank_data = await get_summoner_rank(session, p, platform_id)

        champion_id = part.get("championId")
        mastery_data = await get_champion_mastery(session, p, champion_id)

        # Convert champion_mastery_lastPlayTime -> int
        raw_last_play = mastery_data.get("champion_mastery_lastPlayTime")
        if isinstance(raw_last_play, float):
            raw_last_play = int(raw_last_play)

        # Potential date conversion
        if raw_last_play:
            dt_lp = datetime.datetime.utcfromtimestamp(raw_last_play / 1000.0)
            champion_mastery_lastPlayTime_utc = dt_lp.isoformat() + "Z"
        else:
            champion_mastery_lastPlayTime_utc = None

        final_stats = get_final_champion_stats(timeline_data, part.get("participantId"))
        
        framePart = timeInfo.get("participants", [])
        for i in framePart:
            if i.get("puuid") == p:
                pId = i.get("participantId")

        framesList = timeInfo.get("frames", [])

        for frames in framesList:
            match pId:
                case 1: 
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("1")
                case 2:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("2")
                case 3:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("3")
                case 4:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("4")
                case 5:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("5")
                case 6:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("6")
                case 7:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("7")
                case 8:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("8")
                case 9:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("9")
                case 10:
                    extra = frames.get("participantFrames")
                    partFrame = extra.get("10")

            pos = partFrame.get("position")
            champStats = partFrame.get("championStats")
            damStats = partFrame.get("damageStats")
            
            row_data = {
                "endOfGameResult" : timeInfo.get("endOfGameResult"),
                "frameInterval" : timeInfo.get("frameInterval"),
                "timestamp" : frames.get("timestamp"),
                "armor" : champStats.get("armor"),
                "attackDamage" : champStats.get("attackDamage"),
                "attackSpeed" : champStats.get("attackSpeed"),
                "health" : champStats.get("health"),
                "healthMax" : champStats.get("healthMax"),
                "healthRegen" : champStats.get("healthRegen"),
                "trueDamageDone" : damStats.get("trueDamageDone"),
                "trueDamageDoneToChampions" : damStats.get("trueDamageDoneToChampions"),
                "trueDamageTaken" : damStats.get("trueDamageTaken"),
                "goldPerSecond" : partFrame.get("goldPerSecond"),
                "level" : partFrame.get("level"),
                "xp" :  partFrame.get("xp"),
                "x" : pos.get("x"),
                "y" : pos.get("y")
                }
            row_data.update(final_stats)
            rows.append(row_data)

    return rows

###############################################################################
# 7. SAVING IN CHUNKS AND REMOVING THE PREVIOUS FILE
###############################################################################
def save_chunk_to_csv(all_data, total_rows):
    """
    Creates a file new_league_data_{total_rows}.csv with all the current all_data,
    then removes the previous chunk file (new_league_data_{total_rows-CHUNK_SIZE}.csv).
    """
    if not all_data:
        return

    row_count = len(all_data)
    filename = f"new_league_data_{total_rows}.csv"
    keys = all_data[0].keys()

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(all_data)

    print(f"[SAVE] Wrote {row_count} rows (cumulative) to file: {filename}")

    prev_count = total_rows - CHUNK_SIZE
    if prev_count > 0:
        prev_filename = f"new_league_data_{prev_count}.csv"
        if os.path.exists(prev_filename):
            os.remove(prev_filename)
            print(f"Removed previous file: {prev_filename}")

###############################################################################
# 8. MAIN FUNCTION
###############################################################################
async def main():
    puuid_pool = {INITIAL_PUUID}
    processed_matches = set()

    all_data = []
    total_rows = 0
    rows_since_last_save = 0

    async with ClientSession() as session:
        while total_rows < MAX_ROWS and puuid_pool:
            current_puuid = puuid_pool.pop()
            print(f"[INFO] Fetching match history for PUUID: {current_puuid}")
            match_ids = await get_match_history(session, current_puuid, count=MATCH_HISTORY_COUNT)

            if not match_ids:
                print(f"[WARN] No match_ids for {current_puuid} or error while fetching.")
                continue

            for match_id in match_ids:
                if match_id in processed_matches:
                    continue

                print(f"[INFO] -> Match details {match_id}")
                match_details = await get_match_details(session, match_id)
                if match_details:
                    processed_matches.add(match_id)

                    print(f"[INFO] -> Match timeline {match_id}")
                    timeline = await get_match_timeline(session, match_id)

                    new_rows = await process_match_data(session, match_details, timeline, puuid_pool)
                    for row in new_rows:
                        all_data.append(row)
                        total_rows += 1
                        rows_since_last_save += 1

                        print(f"Processed a total of {total_rows} rows.")

                        if rows_since_last_save >= CHUNK_SIZE:
                            save_chunk_to_csv(all_data, total_rows)
                            rows_since_last_save = 0

                        if total_rows >= MAX_ROWS:
                            print("[INFO] MAX_ROWS limit reached.")
                            break

                if total_rows >= MAX_ROWS:
                    break

    # If there's an unsaved chunk
    if all_data and (total_rows % CHUNK_SIZE != 0):
        save_chunk_to_csv(all_data, total_rows)

    print("[DONE] Data collection complete.")
    print(f"Collected a total of {total_rows} rows.")

###############################################################################
# 9. START
###############################################################################
if __name__ == "__main__":
    asyncio.run(main())
