import json
from types import SimpleNamespace

# temp reed from file logic
# change to get from api later
file = open("backend/app/pred_engine/Data_Converter/match_files/KR_8217431121.txt")
data = file.read()
file.close()

# json to object conversion
match_TL = json.loads(data, object_hook=lambda d: SimpleNamespace(**d))

#temp print for basic testing
print(match_TL.info.endOfGameResult, match_TL.info.gameId)
