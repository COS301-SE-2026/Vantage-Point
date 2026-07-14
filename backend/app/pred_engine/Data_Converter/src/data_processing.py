from MatchInfoObjects import MatchTimeObj  # type: ignore
from MatchInfoObjects import MatchDataObj  # type: ignore

# Get data from api
temp_match = MatchDataObj
temp_timeline = MatchTimeObj

# all data is converted to list form for ease of ML use


def map_replay(puuid):
    info = []
    for i in temp_timeline.info.participants:
        if i.puuid == puuid:
            part_id = i.partcipantId

    info.append(temp_timeline.info.frameInterval)
    for i in temp_timeline.info.frames:
        info.append(i.timestamp)
        match part_id:
            case 1:
                info.extend(i.participantFrames._1.append_mapReplay())
            case 2:
                info.extend(i.participantFrames._2.append_mapReplay())
            case 3:
                info.extend(i.participantFrames._3.append_mapReplay())
            case 4:
                info.extend(i.participantFrames._4.append_mapReplay())
            case 5:
                info.extend(i.participantFrames._5.append_mapReplay())
            case 6:
                info.extend(i.participantFrames._6.append_mapReplay())
            case 7:
                info.extend(i.participantFrames._7.append_mapReplay())
            case 8:
                info.extend(i.participantFrames._8.append_mapReplay())
            case 9:
                info.extend(i.participantFrames._9.append_mapReplay())
            case 10:
                info.extend(i.participantFrames._10.append_mapReplay())

    return info


def profile_data(puuid):
    info = []
    info.append(temp_match.info.endOfGameResult)
    info.append(temp_match.info.gameDuration)
    for i in temp_match.info.participants:
        if i.puuid == puuid:
            info.append(i.champExperience)
            info.append(i.champLevel)
            info.append(i.challenges.goldPerMinute)
            info.append(i.challenges.kda)
            info.append(i.deaths)
            info.append(i.doubleKills)
            info.append(i.killingSprees)
            info.append(i.largestKillingSpree)
            info.append(i.largestMultiKill)
            info.append(i.playerScore0)
            info.append(i.playerScore1)
            info.append(i.playerScore2)
            info.append(i.playerScore3)
            info.append(i.playerScore4)
            info.append(i.playerScore5)
            info.append(i.playerScore6)
            info.append(i.playerScore7)
            info.append(i.playerScore8)
            info.append(i.playerScore9)
            info.append(i.playerScore10)
            info.append(i.playerScore11)
            info.append(i.pentakills)
            info.append(i.quadrakills)
            info.append(i.timePlayed)
            info.append(i.tripleKills)
            info.append(i.unrealKills)
    return info


def map_suggest_data(puuid):
    # this goes into overlay suggestion generation KNN model
    info = map_replay(puuid)
    info.append(temp_match.info.endOfGameResult)
    for i in temp_match.info.participants:
        if i.puuid == puuid:
            info.append(i.championId)
            info.append(i.teamPosition)
            info.append(i.lane)
    for i in temp_timeline.info.frames:
        info.extend(i.participantFrames._1.append_mapSuggest())
        info.extend(i.participantFrames._2.append_mapSuggest())
        info.extend(i.participantFrames._3.append_mapSuggest())
        info.extend(i.participantFrames._4.append_mapSuggest())
        info.extend(i.participantFrames._5.append_mapSuggest())
        info.extend(i.participantFrames._6.append_mapSuggest())
        info.extend(i.participantFrames._7.append_mapSuggest())
        info.extend(i.participantFrames._8.append_mapSuggest())
        info.extend(i.participantFrames._9.append_mapSuggest())
        info.extend(i.participantFrames._10.append_mapSuggest())


def match_data():
    # this goes onto the match page on frontend
    info = []
    info.append(temp_match.info.endOfGameResult)
    info.append(temp_match.info.gameDuration)
    info.append(temp_match.info.gameMode)
    info.append(temp_match.info.gameName)
    info.append(temp_match.info.mapId)
    for i in temp_match.info.participants:
        info.extend(i.append_matchData())
    info.append(temp_match.info.platformId)
    for i in temp_match.info.teams:
        info.extend(i.append_matchData())
    return info
