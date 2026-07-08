import csv
import random
from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.preprocessing import StandardScaler  # type: ignore

file_error_text = "Training file not found"


# needs to be changed still
def get_from_api():
    # change to get from api later
    return


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
    for row in data:
        if r == -1:
            r = r + 1
            continue

        convert_to_int(row, lane, role, pos)
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

    return data_arr, y


def remove_dup(row, prev_row, r):
    # if feature values are identical, take random row
    if r != 0 and row[1:] == prev_row[1:]:
        num = int(random.random())
        if num == 1:  # take row
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

        if remove_dup(row, prev_row, r):
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
        y_data = scaler.fit_transform(y_data)
    # Do train/test split
    x_train, x_test, y_train, y_test = train_test_split(
        x_data, y_data, test_size=0.2, train_size=0.8, random_state=42
    )
    # x is target, y is given
    return x_train, x_test, y_train, y_test


def get_train_test_data_rf(file_name, category):
    # do file check
    try:
        f = open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    with f:
        data = csv.reader(f)
        # kinds of decisions to be made
        # content of data depends on this
        match category:
            case "champion":
                x_data, y_data = format_data_univar(data, 1, 2, 3)
            case "item":
                x_data, y_data = format_data_univar(data, 4, 3, 2)
            case "skill":
                x_data, y_data = format_data_multivar(data, -1, -1, -1)
            case "role":
                x_data, y_data = format_data_multivar(data, 0, -1, 1)

    X_train, X_test, y_train, y_test = train_test_split(
        x_data, y_data, test_size=0.2, random_state=42, stratify=None
    )

    # X is given, y is target
    return X_train, X_test, y_train, y_test
