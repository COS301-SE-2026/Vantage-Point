import asyncio
import csv
import os
from aiohttp import ClientSession
from aiolimiter import AsyncLimiter

###############################################################################
# 1. CONFIGURATION - EDIT THESE VALUES
###############################################################################
RIOT_API_KEY = "" # https://developer.riotgames.com/
MATCH_REGION_BASE_URL = "https://asia.api.riotgames.com"  # e.g. "https://americas.api.riotgames.com", "https://asia.api.riotgames.com", "https://europe.api.riotgames.com" 
BASE_DOMAIN = "kr.api.riotgames.com"   # e.g. "na1.api.riotgames.com", "euw1.api.riotgames.com", etc.

CHUNK_SIZE = 1000         # Every how many rows we create a NEW CSV file
MAX_ROWS = 5000      # How many total rows we want to fetch 100 for coding, 1000 for general testing, 5000 for evaluation, 100000 for final training?
MATCH_HISTORY_COUNT = 30  # How many matches to fetch per PUUID

# Replace with the PUUID you want to start from:
INITIAL_PUUID = "LqFj4hpYKpZZP1lpIFbD3PHR9dz2BVGaMsgwK4VfNxSNzsl_wsoauTYHtUhMNeYKJudqA4LmFfeoQg" # https://developer.riotgames.com/apis#account-v1/GET_getByRiotId

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


def rf_champion(info, participants, puuid_pool):
    rows = []
    
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
        otherPart = info.get("participants")
        for op in otherPart:
            if op.get("puuid") != p:
                if c == 9:
                    continue
                addInfo = {
                    "champ"+str(c) : op.get("championId")
                }
                c = c + 1
                row_data.update(addInfo)
            #endif

        rows.append(row_data)

    return rows


def rf_item(participants, timeInfo, puuid_pool):
    rows = []
    for part in participants:
        p = part.get('puuid')
        if p:
            puuid_pool.add(p)

        framePart = timeInfo.get("participants", [])
        for i in framePart:
            if i.get("puuid") == p: 
                pId = i.get("participantId") 

        framesList = timeInfo.get("frames", [])

        for frame in framesList:
            partFrames = frame.get("participantFrames", [])
            partFrame = partFrames.get(str(pId))
            damage = partFrame.get("damageStats", [])
            champStat = partFrame.get("championStats", [])
            pos = partFrame.get("position")

            eventList = frame.get("events", [])
            for e in eventList:
                if e.get("type") == "ITEM_PURCHASED" and e.get("participantId") == pId:                    
                    row_data = {
                        "itemId" : e.get("itemId"),
                        "timestamp" : e.get("timestamp"),
                        #"lane" : part.get("lane"), 
                        #"role" : part.get("role"), 
                        #"teamPosition" : part.get("teamPosition"), #2
                        #"champExperience" : part.get("champExperience"),
                        #"champLevel" : part.get("champLevel"),
                        #"championId" : part.get("championId"),
                        #"damageDealtToBuildings" : part.get("damageDealtToBuildings"),
                        #"damageDealtToObjectives" : part.get("damageDealtToObjectives"),
                        #"damageDealtToTurrets" : part.get("damageDealtToTurrets"),
                        #"damageSelfMitigated" : part.get("damageSelfMitigated"),
                        #"deaths" : part.get("deaths"),
                        #"inhibitorKills" : part.get("inhibitorKills"),
                        #"inhibitorTakedowns" : part.get("inhibitorTakedowns"),
                        #"inhibitorsLost" : part.get("inhibitorsLost"),
                        #"itemsPurchased" : part.get("itemsPurchased"),
                        #"killingSprees" : part.get("killingSprees"),
                        #"kills" : part.get("kills"),
                        #"totalHeal" : part.get("totalHeal"),
                        #"totalHealsOnTeammates" : part.get("totalHealsOnTeammates"),
                        #"visionScore" : part.get("visionScore"),
                        #"currentGold" : partFrame.get("currentGold"),
                        #"goldPerSecond" : partFrame.get("goldPerSecond"),
                        #"jungleMinionsKilled" : partFrame.get("jungleMiniosKilled"),
                        #"level" : partFrame.get("level"),
                        #"minionsKilled" : partFrame.get("minionsKilled"),
                        #"timeEnemySpentControlled" : partFrame.get("timeEnemySpentControlled"),
                        #"totalGold" : partFrame.get("totalGold"),
                        #"xp" : partFrame.get("xp"),
                        #"x" : pos.get("x"),
                        #"y" : pos.get("y"),
                        #"magicDamageDone" : damage.get("magicDamageDone"),
                        #"magicDamageDoneToChampions" : damage.get("magicDamageDoneToChampions"),
                        #"magicDamageTaken" : damage.get("magicDamageTaken"),
                        #"physicalDamageDone" : damage.get("physicalDamageDone"),
                        #"physicalDamageDoneToChampions" : damage.get("physicalDamageDoneToChampions"),
                        #"physicalDamageTaken" : damage.get("physicalDamageTaken"),
                        #"totalDamageDone" : damage.get("totalDamageDone"),
                        #"totalDamageDoneToChampions" : damage.get("totalDamageDoneToChampions"),
                        #"totalDamageTaken" : damage.get("totalDamageTaken"),
                        #"trueDamageDone" : damage.get("trueDamageDone"),
                        #"trueDamageDoneToChampions" : damage.get("trueDamageDoneToChampions"),
                        #"trueDamageTaken" : damage.get("trueDamageTaken"),
                        #"abilityHaste" : champStat.get("abilityHaste"),
                        #"abilityPower" : champStat.get("abilityPower"),
                        #"armor" : champStat.get("armor"),
                        #"armorPen" : champStat.get("armorPen"),
                        #"armorPenPercent" : champStat.get("armorPenPercent"),
                        #"attackDamage" : champStat.get("attackDamage"),
                        #"attackSpeed" : champStat.get("attackSpeed"),
                        #"bonusArmorPenPercent" : champStat.get("bonusArmorPenPercent"),
                        #"bonusMagicPenPercent" : champStat.get("bonusMagicPenPercent"),
                        #"ccReduction" : champStat.get("ccReduction"),
                        #"cooldownReduction" : champStat.get("cooldownReduction"),
                        #"health" : champStat.get("health"),
                        #"healthMax" : champStat.get("healthMax"),
                        #"healthRegen" : champStat.get("healthRegen"),
                        #"lifesteal" : champStat.get("lifesteal"),
                        #"magicPen" : champStat.get("magicPen"),
                        #"magicPenPercent" : champStat.get("magicPenPercent"),
                        #"magicResist" : champStat.get("magicResist"),
                        #"movementSpeed" : champStat.get("movementSpeed"),
                        #"omnivamp" : champStat.get("omnivamp"),
                        #"physicalVamp" : champStat.get("physicalVamp"),
                        #"power" : champStat.get("power"),
                        #"powerMax" : champStat.get("powerMax"),
                        #"spellVamp" : champStat.get("spellVamp"),
                    }
                    rows.append(row_data)
            
    return rows


def rf_skill(participants, timeInfo, puuid_pool):
    rows = []
    for part in participants:
        p = part.get('puuid')
        if p:
            puuid_pool.add(p)

        framePart = timeInfo.get("participants", [])
        for i in framePart:
            if i.get("puuid") == p: 
                pId = i.get("participantId") 

        framesList = timeInfo.get("frames", [])
        
        for frame in framesList:
            partFrames = frame.get("participantFrames", [])
            partFrame = partFrames.get(str(pId))
            damage = partFrame.get("damageStats", [])
            champStat = partFrame.get("championStats", [])

            pos = partFrame.get("position")

            eventList = frame.get("events", [])
            for e in eventList:
                if e.get("type") == "SKILL_LEVEL_UP" and e.get("participantId") == pId: 
                    row_data = {
                        "skillSlot" : e.get("skillSlot"),
                        "levelUpType" : e.get("levelUpType"),
                        "championId" : part.get("championId"),
                        "damageSelfMitigated" : part.get("damageSelfMitigated"),
                        "deaths" : part.get("deaths"),
                        "kills" : part.get("kills"),
                        "totalHeal" : part.get("totalHeal"),
                        "level" : partFrame.get("level"),
                        "timeEnemySpentControlled" : partFrame.get("timeEnemySpentControlled"),
                        "totalGold" : partFrame.get("totalGold"),
                        "xp" : partFrame.get("xp"),
                        "x" : pos.get("x"),
                        "y" : pos.get("y"),
                        "magicDamageDone" : damage.get("magicDamageDone"),
                        "physicalDamageDone" : damage.get("physicalDamageDone"),
                        "totalDamageDone" : damage.get("totalDamageDone"),
                        "totalDamageDoneToChampions" : damage.get("totalDamageDoneToChampions"),
                        "totalDamageTaken" : damage.get("totalDamageTaken"),
                        "armor" : champStat.get("armor"),
                        "attackDamage" : champStat.get("attackDamage"),
                        "attackSpeed" : champStat.get("attackSpeed"),
                        "health" : champStat.get("health"),
                        "healthMax" : champStat.get("healthMax"),
                        "movementSpeed" : champStat.get("movementSpeed"),
                        "power" : champStat.get("power"),
                        "powerMax" : champStat.get("powerMax"),
                    }
                    rows.append(row_data)
        
    return rows

#teamPosition sometimes turns up empty, this is unusable for training
#need to add edge case resolution somewhere
def rf_role(participants, timeInfo, puuid_pool):
    rows = []
    for part in participants:
        p = part.get('puuid')
        if p:
            puuid_pool.add(p)

        framePart = timeInfo.get("participants", [])
        for i in framePart:
            if i.get("puuid") == p: 
                pId = i.get("participantId") 

        framesList = timeInfo.get("frames", [])

        #gives first and last frame
        #ending and starting stats
        c = 0
        for frame in framesList:
            c = c + 1
            partFrames = frame.get("participantFrames", [])
            partFrame = partFrames.get(str(pId))
            champStat = partFrame.get("championStats", [])
            if c == 1:
                start_movementSpeed = champStat.get("movementSpeed")
                start_health = champStat.get("health")
                start_healthMax = champStat.get("healthMax")
                start_healthRegen = champStat.get("healthRegen")
                start_armor = champStat.get("armor")
            if c == len(framesList):
                end_movementSpeed = champStat.get("movementSpeed")
                end_health = champStat.get("health")
                end_healthMax = champStat.get("healthMax")
                end_healthRegen = champStat.get("healthRegen")
                end_armor = champStat.get("armor")
        
        row_data = {
            "teamPosition" : part.get("teamPosition"),
            "lane" : part.get("lane"),
            "championId" : part.get("championId"),
            "kills" : part.get("kills"),
            "physicalDamageDealt" : part.get("physicalDamageDealt"),
            "totalDamagedealt" : part.get("totalDamageDealt"),
            "magicDamageDealt" : part.get("magicDamageDealt"),
            "totalHeal" : part.get("totalHeal"),
            "totalEnemyJungleMinionsKilled" : part.get("totalEnemyJungleMinionsKilled"),
            "totalHealsOnTeammates" : part.get("totalHealsOnTeammates"),
            "totalUnitsHealed" : part.get("totalUnitsHealed"),
            "wardsKilled" : part.get("wardsKilled"),
            "wardsPlaced" : part.get("wardsPlaced"),
            "detectorWardsPlaced" : part.get("detectorWardsPlaced"),
            "start_movementSpeed" : start_movementSpeed,
            "start_health" : start_health,
            "start_healthMax" : start_healthMax,
            "start_healthRegen" : start_healthRegen,
            "start_armor" : start_armor,
            "end_movementSpeed" : end_movementSpeed,
            "end_health" : end_health,
            "end_healthMax" : end_healthMax,
            "end_healthRegen" : end_healthRegen,
            "end_armor" : end_armor,
        }
        rows.append(row_data)
    return rows


async def process_match_data(session, match_data, timeline_data, puuid_pool):
    if not match_data:
        return []

    info = match_data["info"]
    participants = info.get("participants", [])
    timeInfo = timeline_data["info"]

    #different data set collections
    #rows = knn(participants, timeInfo, puuid_pool)
    #rows = rf_champion(info, participants, puuid_pool)
    #rows = rf_item(participants, timeInfo, puuid_pool)
    rows = rf_skill(participants, timeInfo, puuid_pool)
    #rows = rf_role(participants, timeInfo, puuid_pool)

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
    filename = f"test{row_count}.csv"
    keys = all_data[0].keys()

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(all_data)

    print(f"[SAVE] Wrote {row_count} rows (cumulative) to file: {filename}")

    prev_count = total_rows - CHUNK_SIZE
    if prev_count > 0:
        prev_filename = f"test{prev_count}.csv"
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

                        #print(f"Processed a total of {total_rows} rows.")

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

    
