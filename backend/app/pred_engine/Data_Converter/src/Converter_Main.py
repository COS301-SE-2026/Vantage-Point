import json
import csv
import numpy as np
from types import SimpleNamespace
from sklearn.model_selection import train_test_split

COL_COUNT = 42

#needs to be changed still
def getFromAPI():
    # temp read from file logic
    # change to get from api later
    file = open("backend/app/pred_engine/Data_Converter/match_files/KR_8217431121.txt")
    data = file.read()
    file.close()

    # json to object conversion
    match_TL = json.loads(data, object_hook=lambda d: SimpleNamespace(**d))

    # temp print for basic testing
    print(match_TL.info.endOfGameResult, match_TL.info.gameId)
    
#need to seperate out pos data as X -> to be predicted
#group by player, multiple row needed because timeline and frames
#X is all position data in order
def formatTrainTestData(data):
    r, c = (1, 1)
    dataArr = []
    X = []
    r, c, cPos = (-1, 0, 0)
    for row in data:
        #add logic to convert everything to int
        for j in range(len(row)):
            if row[j] == "GameComplete":
                row[j] = 1
            else:
                row[j] = int(row[j])
        #if timestamp == 0 increment x, reset c
        timestamp = row[2]
        if timestamp == 0:
            dataArr.append([])
            X.append([])
            r = r + 1
            c = 0
        #add row items to array
        for i in row:
            #x coord = pos 15 y coord = pos 16
            if c % COL_COUNT == 15 or c % COL_COUNT == 16:
                X[r].append(i)
            else:
                dataArr[r].append(i)
            c = c + 1
        print()
    #find way to work out n_samples
    return X, dataArr, n_samples

def getTrainTestData(fileName):
    with open(fileName, "r") as f:
        data = csv.reader(f)
        xData, yData, val = formatTrainTestData(data)
    #Do train/test split
    xData = np.arange(val) 
    yData = np.arange(val)
    X_train, X_test, y_train, y_test = train_test_split(
        xData, yData, test_size=0.2, train_size=0.8, random_state=42
    
    )
    #return train,test
    return X_train, X_test, y_train, y_test

#testing
x1, x2, y1, y2 = getTrainTestData("backend/app/pred_engine/Data_Converter/src/test.csv")
print(x1)
print(x2)
print("")
print(y1)
print(y2)
