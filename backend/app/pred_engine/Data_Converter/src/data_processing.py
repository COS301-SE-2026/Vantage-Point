import backend.app.pred_engine.Data_Converter.src.MatchInfoObjects as MatchInfoObjects
from MatchInfoObjects import MatchTimeObj
from MatchInfoObjects import MatchDataObj

#Get data from api
tempMatch = MatchDataObj
tempTimeline = MatchTimeObj

#all data is converted to record form for ease of ML use

    #for i in MatchTimeObj.info.participants:
    #    if i.puuid == puuid:
    #        partID = i.partcipantId

def map_replay(puuid):
    print()

def profile_data(puuid):
    print()

def map_suggest_data():
    print()
    #this goes into overlay suggestion generation KNN model

def match_data():
    print()
    #this goes onto the match page on frontend

def match_rec_data():
    print()
    #data that goes into RF to get gameplay tips

