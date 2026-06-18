import asyncio
import csv
import os
#added to installs aiohttp-3.14.1 aiolimiter-1.2.1
from aiohttp import ClientSession
from aiolimiter import AsyncLimiter

###############################################################################
# 1. CONFIGURATION - EDIT THESE VALUES
###############################################################################
RIOT_API_KEY = "RGAPI-733ac11a-9c78-4598-8e79-80488d30d5c5" # https://developer.riotgames.com/
MATCH_REGION_BASE_URL = "https://asia.api.riotgames.com"  # e.g. "https://americas.api.riotgames.com", "https://asia.api.riotgames.com", "https://europe.api.riotgames.com" 
BASE_DOMAIN = "kr.api.riotgames.com"   # e.g. "na1.api.riotgames.com", "euw1.api.riotgames.com", etc.

CHUNK_SIZE = 2000         # Every how many rows we create a NEW CSV file
MAX_ROWS = 200      # How many total rows we want to fetch
MATCH_HISTORY_COUNT = 30  # How many matches to fetch per PUUID

# Replace with the PUUID you want to start from:
INITIAL_PUUID = "4-GEPC9UQbnSCPrA5KWpvs0SahgJcHWvnS49oF2cCwTASobXIxl85MtL_wK7JWxkkQOyvy_DF-RWRQ" # https://developer.riotgames.com/apis#account-v1/GET_getByRiotId

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

###############################################################################
# 6. DATA PROCESSING
###############################################################################
async def process_match_data(session, match_data, timeline_data, puuid_pool):
    if not match_data:
        return []

    info = match_data["info"]
    participants = info.get("participants", [])

    timeInfo = timeline_data["info"]

    rows = []
    for part in participants:
        p = part.get("puuid")
        if p:
            puuid_pool.add(p)
        
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
                "y" : pos.get("y"),
                "teamPosition" : part.get("teamPosition"),
                "lane" : part.get("lane"),
                "championId" : part.get("championId")
                }
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

    
