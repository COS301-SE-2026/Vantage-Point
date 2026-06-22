import json
import csv
import numpy as np
from types import SimpleNamespace
from sklearn.model_selection import train_test_split

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
    
def formatTrainTestDataKNN(data):
    r, c = (1, 1)
    dataArr = []
    X = []
    r, c, cPos = (-1, 0, 0)
    rCount = 0
    for row in data:
        if rCount == 0:
            rCount = rCount + 1
            continue
        #add logic to convert everything to int
        for j in range(len(row)):
            if any(char.isdigit() for char in row[j]):
                row[j] = int(row[j])  
        row[0] = 1
        val = row[1]
        match val:
            case 'TOP':
                row[1] = 1
            case 'JUNGLE':
                row[1] = 2
            case 'MIDDLE':
                row[1] = 3
            case 'BOTTOM':
                row[1] = 4
            case 'UTILITY':
                row[1] = 5
        val = row[2]
        match val:
            case 'TOP':
                row[2] = 1
            case 'MIDDLE':
                row[2] = 2
            case 'BOTTOM':
                row[2] = 3
            case 'JUNGLE':
                row[2] = 4
            case 'NONE':
                row[2] = 0  
        for j in range(len(row)):
            if not isinstance(row[j], int):
                row[j] = 0 
        dataArr.append([])
        X.append([])
        r = r + 1
        c = 0
        #add row items to array
        for i in row:
            #x coord = pos 15 y coord = pos 16
            if c == 3 or c == 4:
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
        xData, yData = formatTrainTestDataKNN(data)
    #Do train/test split

    X_train, X_test, y_train,y_test = train_test_split(
        xData, yData, test_size=0.2, train_size=0.8, random_state=42
    )
    #return train,test
    #x is target, y is given
    return X_train, X_test, y_train, y_test

#x1, x2, y1, y2 = getTrainTestDataKNN("test.csv")

#print(x1)
#print(x2)
#print()
#print()
#print(y1)
#print(y2)

def formatChampionData(data):
    print(data)

def formatItemData(data):
    print(data)

def formatSkillData(data):
    print(data)

def getTrainTestDataRF(fileName, category):
    with open(fileName, "r") as f:
        data = csv.reader(f)
        
    #kinds of decisions to be made
    #content of data depends on this
    match category:
        case 'champion':
            xData, yData = formatChampionData(data)
        case 'item':
            xData, yData = formatItemData(data)
        case 'skill':
            xData, yData = formatSkillData(data)

    X_train, X_test, y_train, y_test = train_test_split(
        xData, yData, test_size=0.2, random_state=42, stratify=yData
    )

    #X is given, y is target
    return X_train, X_test, y_train, y_test