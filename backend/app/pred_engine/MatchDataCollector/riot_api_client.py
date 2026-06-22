import asyncio
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

CHUNK_SIZE = 100000         # Every how many rows we create a NEW CSV file
MAX_ROWS = 100      # How many total rows we want to fetch
MATCH_HISTORY_COUNT = 30  # How many matches to fetch per PUUID

# Replace with the PUUID you want to start from:
INITIAL_PUUID = "bsuc47FJnJ3F_C6HcVbrmr7y3T7Vl6wMksDoiC9M0hyUJHcFsHk0se5DnwutWJ0QXhWynFcD2-2kig" # https://developer.riotgames.com/apis#account-v1/GET_getByRiotId

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

def knn(participants, timeInfo, puuid_pool):
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
            extra = frames.get("participantFrames")
            match pId:
                case 1: 
                    partFrame = extra.get("1")
                    num = 1
                case 2:
                    partFrame = extra.get("2")
                    num = 2
                case 3:
                    partFrame = extra.get("3")
                    num = 3
                case 4:
                    partFrame = extra.get("4")
                    num = 4
                case 5:
                    partFrame = extra.get("5")
                    num = 5
                case 6:
                    partFrame = extra.get("6")
                    num = 6
                case 7:
                    partFrame = extra.get("7")
                    num = 7
                case 8:
                    partFrame = extra.get("8")
                    num = 8
                case 9:
                    partFrame = extra.get("9")
                    num = 9
                case 10:
                    partFrame = extra.get("10")
                    num = 10

            pos = partFrame.get("position")
            champStats = partFrame.get("championStats")
            
            row_data = {
                "endOfGameResult" : timeInfo.get("endOfGameResult"),
                "teamPosition" : part.get("teamPosition"),
                "lane" : part.get("lane"),
                "x" : pos.get("x"),
                "y" : pos.get("y"),
                "frameInterval" : timeInfo.get("frameInterval"),
                "timestamp" : frames.get("timestamp"),
                "armor" : champStats.get("armor"),
                "attackDamage" : champStats.get("attackDamage"),
                "health" : champStats.get("health"),
                "level" : partFrame.get("level"),
                "xp" :  partFrame.get("xp"),
                "championId" : part.get("championId"),
                "healthMax" : champStats.get("healthMax"),
                "timeEnemySpentControlled" : partFrame.get("timeEnemySpentControlled"),
                "movementSpeed" : champStats.get("movementSpeed"),
            }

            c = 0
            for i in range(1,11):
                if i != num:
                    p = extra.get(str(i))
                    pos = p.get("position")
                    addPos = {
                        "x"+str(c) : pos.get("x"),
                        "y"+str(c) : pos.get("y")
                    }
                    row_data.update(addPos)
                    c = c + 1

            rows.append(row_data)
            #events?
    return rows

#returns champion id
#data going in:
    #team position
    #role
    #lane
    #other champs
    #bans
def rf_champion(info, participants, puuid_pool):
    rows = []

    teams = info.get('teams', [])
    
    for part in participants:
        p = part.get("puuid")
        if p:
            puuid_pool.add(p)

        row_data = {
            "championId" : part.get("championId"),
            "teamPosition" : part.get("teamPosition"),
            "role": part.get("role"),
            "lane" : part.get("lane"),
        }

        c = 0
        for t in teams:
            bans = t.get("bans")
            for b in bans:
                addInfo = {
                    "championId"+str("c") : b.get("championId")
                }
                c = c + 1
                row_data.update(addInfo)

        c = 0
        otherPart = info.get("participants")
        for op in otherPart:
            if op.get("puuid") != p:
                addInfo = {
                    "champ"+str(c) : op.get("championId")
                }
                c = c + 1
                row_data.update(addInfo)
            #endif

        rows.append(row_data)

    return rows

def rf_item(info, participants, timeInfo, puuid_pool):
    rows = []
    return rows

def rf_perk(info, participants, timeInfo, puuid_pool):
    rows = []
    return rows

async def process_match_data(session, match_data, timeline_data, puuid_pool):
    if not match_data:
        return []

    info = match_data["info"]
    participants = info.get("participants", [])
    timeInfo = timeline_data["info"]

    #different data set collections
    #rows = knn(participants, timeInfo, puuid_pool)
    rows = rf_champion(info, participants, puuid_pool)
    #rows = rf_item()
    #rows = rf_perk()

    return rows

###############################################################################
# 7. VARIABLES NOT GOOD FOR OPTIMIZATION
###############################################################################

                #"healthRegen" : champStats.get("healthRegen"),
                #"trueDamageDone" : damStats.get("trueDamageDone"),
                #"trueDamageDoneToChampions" : damStats.get("trueDamageDoneToChampions"),
                #"trueDamageTaken" : damStats.get("trueDamageTaken"),
                #"goldPerSecond" : partFrame.get("goldPerSecond"),
                #"attackSpeed" : champStats.get("attackSpeed"),
                #"abilityHaste" : champStats.get("abilityHaste"),
                #"power" : champStats.get("power"),

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
    filename = f"test.csv"
    keys = all_data[0].keys()

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(all_data)

    print(f"[SAVE] Wrote {row_count} rows (cumulative) to file: {filename}")

    prev_count = total_rows - CHUNK_SIZE
    if prev_count > 0:
        prev_filename = f"test.csv"
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

    
