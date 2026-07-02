import json
import csv
import random
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
    y = []
    r, c = (-1, 0, )
    rCount = 0
    for row in data:
        if rCount == 0:
            rCount = rCount + 1
            continue
        #add logic to convert everything to int
        for j in range(len(row)):
            if any(char.isdigit() for char in row[j]):
                row[j] = int(row[j])  
        val = row[3]#lane
        match val:
            case 'TOP':
                row[3] = 1
            case 'MIDDLE':
                row[3] = 2
            case 'BOTTOM':
                row[3] = 3
            case 'JUNGLE':
                row[3] = 4
            case 'NONE':
                row[3] = 0  
        val = row[4]#role
        match val:
            case 'NONE':
                row[4] = 0
            case 'SOLO':
                row[4] = 1
            case 'CARRY':
                row[4] = 2
            case 'SUPPORT':
                row[4] = 3
            case 'DUO':
                row[4] = 4
        val = row[2]#team position
        match val:
            case 'TOP':
                row[2] = 1
            case 'JUNGLE':
                row[2] = 2
            case 'MIDDLE':
                row[2] = 3
            case 'BOTTOM':
                row[2] = 4
            case 'UTILITY':
                row[2] = 5
        for j in range(len(row)):
            if not isinstance(row[j], int):
                row[j] = 0 
        dataArr.append([])
        y.append([])
        r = r + 1
        c = 0
        #add row items to array
        for i in row:
            if c == 0 or c == 1:
                y[r].append(i)
            else:
                dataArr[r].append(i)
            c = c + 1
        print()
    return y, dataArr

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

#-----------------------------------------------------------------------------------#

#returns champion id
def formatChampionData(data):
    dataArr = []
    y = []
    r = -1
    for row in data:
        if r == -1:
            r = r + 1
            continue

        for j in range(len(row)):
            if any(char.isdigit() for char in row[j]):
                row[j] = int(row[j])  
        val = row[1]#team position
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
        val = row[2]#role
        match val:
            case 'NONE':
                row[2] = 0
            case 'SOLO':
                row[2] = 1
            case 'CARRY':
                row[2] = 2
            case 'SUPPORT':
                row[2] = 3
            case 'DUO':
                row[2] = 4
        val = row[3]#lane
        match val:
            case 'TOP':
                row[3] = 1
            case 'MIDDLE':
                row[3] = 2
            case 'BOTTOM':
                row[3] = 3
            case 'JUNGLE':
                row[3] = 4
            case 'NONE':
                row[3] = 0  
        for j in range(len(row)):
            if not isinstance(row[j], int):
                row[j] = 0 

        dataArr.append([])
        y.append([])

        c = 0
        for i in row:
            if c == 0:
                y[r].append(i)
                c = c + 1
            else:
                dataArr[r].append(i)
                c = c + 1
        r = r + 1

    return dataArr, y


#returns itemId
def formatItemData(data):
    dataArr = []
    y = []
    r = -1

    for row in data:
        if r == -1:
            r = r + 1
            continue

        for j in range(len(row)):
            if any(char.isdigit() for char in row[j]):
                row[j] = int(row[j])  
        val = row[2]#lane
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
        val = row[3]#role
        match val:
            case 'NONE':
                row[3] = 0
            case 'SOLO':
                row[3] = 1
            case 'CARRY':
                row[3] = 2
            case 'SUPPORT':
                row[3] = 3
            case 'DUO':
                row[3] = 4
        val = row[4]#team position
        match val:
            case 'TOP':
                row[4] = 1
            case 'JUNGLE':
                row[4] = 2
            case 'MIDDLE':
                row[4] = 3
            case 'BOTTOM':
                row[4] = 4
            case 'UTILITY':
                row[4] = 5
        for j in range(len(row)):
            if not isinstance(row[j], int):
                row[j] = 0 
        
        
        #if feature values are identical, take random one only
        if r!=0 and row[1:] == prevRow[1:]:
            #random value for if we are gonna use row or prev row
            num = int(random.random())
            if num == 0: #take prevRow
                continue
            elif num == 1: #take row
                r = r - 1
                y[r] = []
                dataArr[r] = []
        else:
            dataArr.append([])
            y.append([])

        c = 0
        for i in row:
            if c == 0:
                y[r].append(i)
                c = c + 1
            else:
                dataArr[r].append(i)
                c = c + 1
        r = r + 1
        prevRow = row
    
    return dataArr, y


#return skillSlot,leveluptype
def formatSkillData(data):
    dataArr = []
    y = []
    r = -1

    for row in data:
        if r == -1:
            r = r + 1
            continue

        for j in range(len(row)):
            if any(char.isdigit() for char in row[j]):
                row[j] = int(row[j]) 
        val = row[1]
        match val:
            case 'NORMAL':
                row[1] = 1 
            case 'EVOLVE':
                row[1] = 2      
        for j in range(len(row)):
            if not isinstance(row[j], int):
                row[j] = 0 
        
        #if feature values are identical, take random one only
        if r!=0 and row[1:] == prevRow[1:]:
            #random value for if we are gonna use row or prev row
            num = int(random.random())
            if num == 0: #take prevRow
                continue
            elif num == 1: #take row
                r = r - 1
                y[r] = []
                dataArr[r] = []
                #y = np.delete(y, (r), axis=0)
                #dataArr = np.delete(dataArr, (r), axis=0)
        else:
            dataArr.append([])
            y.append([])

        c = 0
        for i in row:
            if c == 0 or c == 1:
                y[r].append(i)
                c = c + 1
            else:
                dataArr[r].append(i)
                c = c + 1
        r = r + 1
        prevRow = row
    
    return dataArr, y


#return lane/teamPosition
def formatRoleData(data):
    dataArr = []
    y = []
    r = -1

    for row in data:
        if r == -1:
            r = r + 1
            continue

        if row[0] == '':
            #is a blank
            continue

        for j in range(len(row)):
            if any(char.isdigit() for char in row[j]):
                row[j] = int(row[j]) 
        val = row[0]
        match val:
            case 'TOP':
                row[0] = 1
            case 'JUNGLE':
                row[0] = 2
            case 'MIDDLE':
                row[0] = 3
            case 'BOTTOM':
                row[0] = 4
            case 'UTILITY':
                row[0] = 5
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
            case 'NONE':
                row[1] = 0
        for j in range(len(row)):
            if not isinstance(row[j], int):
                row[j] = 0 

        dataArr.append([])
        y.append([])

        c = 0
        for i in row:
            if c == 0 or c == 1:
                y[r].append(i)
                c = c + 1
            else:
                dataArr[r].append(i)
                c = c + 1
        r = r + 1

    return dataArr, y


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
            case 'role':
                xData, yData = formatRoleData(data)

    X_train, X_test, y_train, y_test = train_test_split(
        xData, yData, test_size=0.2, random_state=42, stratify=None
    )

    #X is given, y is target
    return X_train, X_test, y_train, y_test

#xtr, xt, ytr, yt, skip = getTrainTestDataKNN('test5000.csv')
#print(len(xtr)+len(xt))
#print(skip)

#print(xtr)
#print(xt)
#print()
#print()
#print(ytr)
#print(yt)