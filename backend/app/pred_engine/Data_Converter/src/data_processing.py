import backend.app.pred_engine.Data_Converter.src.MatchInfoObjects as MatchInfoObjects
from MatchInfoObjects import MatchTimeObj
from MatchInfoObjects import MatchDataObj

# Get data from api
tempMatch = MatchDataObj
tempTimeline = MatchTimeObj

# all data is converted to list form for ease of ML use

# for i in MatchTimeObj.info.participants:
#    if i.puuid == puuid:
#        partID = i.partcipantId


def map_replay(puuid):
    info = []
    for i in tempTimeline.info.participants:
        if i.puuid == puuid:
            partID = i.partcipantId

    info.append(tempTimeline.info.frameInterval)
    for i in tempTimeline.info.frames:
        info.append(i.timestamp)
        match partID:
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
    return []


def map_suggest_data(puuid):
    # this goes into overlay suggestion generation KNN model
    info = map_replay()
    info.append(tempMatch.info.endOfGameResult)
    info.append(tempTimeline.info.frameInterval)

    for i in tempTimeline.info.frames:
        info.append(i.timestamp)
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
    return []


def match_rec_data():
    # data that goes into RF to get gameplay tips
    return []
