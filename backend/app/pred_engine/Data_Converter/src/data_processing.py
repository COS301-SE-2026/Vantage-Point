import backend.app.pred_engine.Data_Converter.src.MatchInfoObjects as MatchInfoObjects
from MatchInfoObjects import MatchTimeObj
from MatchInfoObjects import MatchDataObj

#Get data from api
tempMatch = MatchDataObj
tempTimeline = MatchTimeObj

def team_data_extract(puuid):
    #extract data from team that has puuid

    print()

def player_data_extract(puuid):
    #extract data of specific player according to puuid

    #get participant id that matches puuid
    for i in MatchTimeObj.info.participants:
        if i.puuid == puuid:
            partID = i.partcipantId
    
    #pull out all data from MatchObj file that is relevant to player

def map_data_extract(puuid):
    #extract data fro map overlay
    print()