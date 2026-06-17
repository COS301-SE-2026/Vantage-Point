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
#maybe dont group data with one array row for each player?
#keep timeframes are entirely seperate entities/array rows?
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
    return X, dataArr

def getTrainTestDataKNN(fileName):
    with open(fileName, "r") as f:
        data = csv.reader(f)
        xData, yData = formatTrainTestData(data)
    #Do train/test split

    X_train, X_test, y_train,y_test = train_test_split(
        xData, yData, test_size=0.2, train_size=0.8, random_state=42
    )
    #return train,test
    return X_train, X_test, y_train, y_test
