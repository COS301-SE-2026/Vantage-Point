from typing import List, Optional
from pydantic import BaseModel

class Participant(BaseModel):
    summonerName: str
    championName: str
    teamId: int
    puuid: str

class MatchMetaData(BaseModel):
    matchId: str
    participant: List[str]

class MatchInfo(BaseModel):
    gaameId: int
    gameMode: str
    participants: List[str]
    
class RiotMatchResponse(BaseModel):
    metadata: MatchMetaData
    info: MatchInfo