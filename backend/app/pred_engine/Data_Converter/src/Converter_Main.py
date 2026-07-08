import json
import csv
import random
from types import SimpleNamespace
from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.preprocessing import StandardScaler  # type: ignore


# needs to be changed still
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


def convertToInt(row, lane, role, pos):
    # add logic to convert everything to int
    for j in range(len(row)):
        if any(char.isdigit() for char in row[j]):
            row[j] = int(row[j])

    if lane != -1:
        val = row[lane]  # lane
        match val:
            case "TOP":
                row[lane] = 1
            case "MIDDLE":
                row[lane] = 2
            case "BOTTOM":
                row[lane] = 3
            case "JUNGLE":
                row[lane] = 4
            case "NONE":
                row[lane] = 0
    if role != -1:
        val = row[role]  # role
        match val:
            case "NONE":
                row[role] = 0
            case "SOLO":
                row[role] = 1
            case "CARRY":
                row[role] = 2
            case "SUPPORT":
                row[role] = 3
            case "DUO":
                row[role] = 4
    if pos != -1:
        val = row[pos]  # team position
        match val:
            case "TOP":
                row[pos] = 1
            case "JUNGLE":
                row[pos] = 2
            case "MIDDLE":
                row[pos] = 3
            case "BOTTOM":
                row[pos] = 4
            case "UTILITY":
                row[pos] = 5
    if pos == -1 and role == -1 and lane == -1: #this is skill data
        val = row[1]  # level up type
        match val:
            case "NORMAL":
                row[1] = 1
            case "EVOLVE":
                row[1] = 2

    for j in range(len(row)):
        if not isinstance(row[j], int):
            row[j] = 0


def formatDataUnivar(data, pos, role, lane):
    r = -1
    dataArr = []
    y = []
    for row in data:
        if r == -1:
            r = r + 1
            continue

        convertToInt(row, lane, role, pos)
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


def formatDataMultivar(data, pos, role, lane):
    r = -1
    dataArr = []
    y = []
    for row in data:
        if r == -1:
            r = r + 1
            continue

        convertToInt(row, lane, role, pos)

        if pos == -1 and role == -1 and lane == -1: #this is skill data
            # if feature values are identical, take random one only
            if r != 0 and row[1:] == prevRow[1:]:
                # random value for if we are gonna use row or prev row
                num = int(random.random())
                if num == 0:  # take prevRow
                    continue
                elif num == 1:  # take row
                    r = r - 1
                    y[r] = []
                    dataArr[r] = []
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


# -----------------------------------------------------------------------------------#


def getTrainTestDataKNN(fileName):
    with open(fileName, "r") as f:
        data = csv.reader(f)
        xData, yData = formatDataMultivar(data, 2, 4, 3)

        scaler = StandardScaler()
        yData = scaler.fit_transform(yData)
    # Do train/test split

    X_train, X_test, y_train, y_test = train_test_split(
        xData, yData, test_size=0.2, train_size=0.8, random_state=42
    )
    # x is target, y is given
    return X_train, X_test, y_train, y_test


def getTrainTestDataRF(fileName, category):
    with open(fileName, "r") as f:
        data = csv.reader(f)
        # kinds of decisions to be made
        # content of data depends on this
        match category:
            case "champion":
                xData, yData = formatDataUnivar(data, 1, 2, 3)
            case "item":
                xData, yData = formatDataUnivar(data, 4, 3, 2)
            case "skill":
                xData, yData = formatDataMultivar(data, -1, -1, -1)
            case "role":
                xData, yData = formatDataMultivar(data, 0, -1, 1)

    X_train, X_test, y_train, y_test = train_test_split(
        xData, yData, test_size=0.2, random_state=42, stratify=None
    )

    # X is given, y is target
    return X_train, X_test, y_train, y_test
