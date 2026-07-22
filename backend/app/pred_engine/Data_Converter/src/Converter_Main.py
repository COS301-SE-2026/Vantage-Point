from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.preprocessing import StandardScaler  # type: ignore
import csv
import sys

sys.path.insert(1, "/workspaces/backend/app")
from Models.riot_schemas import (
    MapSuggestData,
    ChampionData,
    ItemData,
    SkillData,
    RoleData,
)

file_error_text = "Training file not found"
type_err = "Input data is the wrong type"


def convert_to_int(row, lane, role, pos):
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
    if pos == -1 and role == -1 and lane == -1:  # this is skill data
        val = row[1]  # level up type
        match val:
            case "NORMAL":
                row[1] = 1
            case "EVOLVE":
                row[1] = 2

    for j in range(len(row)):
        if not isinstance(row[j], int):
            row[j] = 0


def format_data_univar(data, pos, role, lane):
    r = -1
    data_arr = []
    y = []
    prev_row = []

    for row in data:
        if r == -1:
            r = r + 1
            continue

        convert_to_int(row, lane, role, pos)

        # if item data (4, 3, 2)
        if pos == 4 and role == 3 and lane == 2 and remove_dup(row, prev_row, r):
            r = r - 1
            y[r] = []
            data_arr[r] = []
        else:
            data_arr.append([])
            y.append([])

        c = 0
        for i in row:
            if c == 0:
                y[r].append(i)
                c = c + 1
            else:
                data_arr[r].append(i)
                c = c + 1
        r = r + 1
        prev_row = row

    return data_arr, y


def remove_dup(row, prev_row, r):
    # if feature values are identical, take new row
    if r != 0 and row[1:] == prev_row[1:]:
        return True
    else:
        return False


def format_data_multivar(data, pos, role, lane):
    r = -1
    data_arr = []
    y = []
    prev_row = []

    for row in data:
        if r == -1:
            r = r + 1
            continue

        convert_to_int(row, lane, role, pos)

        # if skill data (-1, -1, -1)
        if pos == -1 and role == -1 and lane == -1 and remove_dup(row, prev_row, r):
            r = r - 1
            y[r] = []
            data_arr[r] = []
        else:
            data_arr.append([])
            y.append([])

        c = 0
        for i in row:
            if c == 0 or c == 1:
                y[r].append(i)
                c = c + 1
            else:
                data_arr[r].append(i)
                c = c + 1
        r = r + 1
        prev_row = row

    return data_arr, y


# -----------------------------------------------------------------------------------#


def get_train_test_data_knn(file_name):
    # do file check
    try:
        f = open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    with f:
        data = csv.reader(f)
        x_data, y_data = format_data_multivar(data, 2, 4, 3)

        scaler = StandardScaler()
        x_data = scaler.fit_transform(x_data)  # pyright: ignore[reportArgumentType]
    # Do train/test split
    x_train, x_test, y_train, y_test = train_test_split(
        x_data, y_data, test_size=0.2, train_size=0.8, random_state=42
    )
    # x is given, y is target
    return x_train, x_test, y_train, y_test


def get_train_test_data_rf(file_name, category):
    # do file check
    try:
        f = open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    x_data = []
    y_data = []

    with f:
        data = csv.reader(f)
        # kinds of decisions to be made
        # content of data depends on this
        match category:
            case "champion":
                x_data, y_data = format_data_univar(data, 1, 2, 3)
            case "item":
                x_data, y_data = format_data_univar(data, 4, 3, 2)  # remove dup
            case "skill":
                x_data, y_data = format_data_multivar(data, -1, -1, -1)  # remove dup
            case "role":
                x_data, y_data = format_data_multivar(data, 0, -1, 1)

    X_train, X_test, y_train, y_test = train_test_split(
        x_data, y_data, test_size=0.2, random_state=42, stratify=None
    )

    # X is given, y is target
    return X_train, X_test, y_train, y_test


# -----------------------------------------------------------------------------------#


def convert_to_rows(data):
    data_arr = []

    if (
        isinstance(data, MapSuggestData)
        or isinstance(data, ChampionData)
        or isinstance(data, ItemData)
        or isinstance(data, SkillData)
        or isinstance(data, RoleData)
    ):
        data_arr = data.convert_to_arr()
    elif isinstance(data, list) and (not isinstance(data[0], list)): #check if 1D array
        data_arr.append(data)
    else: 
        print(type_err)
    
    return data_arr    


def format_api_data_knn(obj_data):
    data = obj_data
    x_data_rows = []
    y_data_rows = []

    # need to convert to consist of a row of data for each frame
    data = convert_to_rows(data)

    # run thru format function
    x_data_rows, y_data_rows = format_data_multivar(data, 2, 4, 3)

    # x is target, y is given
    return x_data_rows, y_data_rows


def format_api_data_rf(obj_data, category):
    data = obj_data
    x_data_rows = []
    y_data_rows = []

    # need to convert to consist of a row of data for each frame
    data = convert_to_rows(data)

    # run thru format function
    match category:
        case "champion":
            x_data_rows, y_data_rows = format_data_univar(data, 1, 2, 3)
        case "item":
            x_data_rows, y_data_rows = format_data_univar(data, 4, 3, 2)
        case "skill":
            x_data_rows, y_data_rows = format_data_multivar(data, -1, -1, -1)
        case "role":
            x_data_rows, y_data_rows = format_data_multivar(data, 0, -1, 1)

    # X is given, y is target
    return x_data_rows, y_data_rows


"""
testObj = MapSuggestData(
            position_x=[0,1,2,3],
            position_y=[0,1,2,3],
            team_position="a",
            lane="lane",
            role="role",
            timestamp=[0,1,2,3],
            prev_x=[0,1,2,3],
            prev_y=[0,1,2,3],
            prev_prev_x=[0,1,2,3],
            prev_prev_y=[0,1,2,3],
            champExperience=0,
            champLevel=1,
            championId=2,
            gameDuration=3,
            deaths=4,
            itemsPurchased=5,
            killingSprees=6,
            kills=7,
            visionScore=8,
            jungleMinionsKilled=[0,1,2,3],
            level=[0,1,2,3],
            minionsKilled=[0,1,2,3],
            timeEnemySpentControlled=[0,1,2,3],
            xp=[0,1,2,3],
            totalDamageDone=[0,1,2,3],
            totalDamageDoneToChampions=[0,1,2,3],
            totalDamageTaken=[0,1,2,3],
            abilityHaste=[0,1,2,3],
            abilityPower=[0,1,2,3],
            armor=[0,1,2,3],
            attackDamage=[0,1,2,3],
            attackSpeed=[0,1,2,3],
            ccReduction=[0,1,2,3],
            cooldownReduction=[0,1,2,3],
            health=[0,1,2,3],
            health_max=[0,1,2,3],
            health_regen=[0,1,2,3],
            lifesteal=[0,1,2,3],
            movementSpeed=[0,1,2,3],
            power=[0,1,2,3],
            powerMax=[0,1,2,3],
        )

testArr = testObj.convert_to_arr()
print(type(testArr))
print(testArr)
"""
