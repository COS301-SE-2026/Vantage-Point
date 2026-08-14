from app.pred_engine import knn_model as knn  # type: ignore
from app.pred_engine import rf_model as rf  # type: ignore
from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore
import json
import math
import numpy as np


# stats function to get distances + deviation
def avg_and_std(y_data):
    dist = []
    for i in range(0, len(y_data)):
        for j in range(0, len(y_data)):
            if i != j:
                dist.append(abs(math.dist(y_data[i], y_data[j])))

    avg = sum(dist) / len(dist)
    std = np.std(dist, ddof=1)

    return avg, std


def create_rf_models():
    champ_rf = rf.final_train(
        "/workspaces/backend/app/pred_engine/Training_csv/champ_rf_training.csv",
        "champion",
    )
    item_rf = rf.final_train(
        "/workspaces/backend/app/pred_engine/Training_csv/item_rf_training.csv", "item"
    )
    role_rf = rf.final_train(
        "/workspaces/backend/app/pred_engine/Training_csv/role_rf_training.csv", "role"
    )
    skill_rf = rf.final_train(
        "/workspaces/backend/app/pred_engine/Training_csv/skill_rf_training.csv",
        "skill",
    )

    return champ_rf, item_rf, role_rf, skill_rf


def create_knn_model():

    knn_models = knn.get_knn("test100000.csv")

    return knn_models


# run functions will call error correctors
def correct_knn(y_output, y_data):
    # get average dist between y_data points
    avg, std = avg_and_std(y_data)
    y_corrected = []

    y_corrected.append(y_data[0])

    # if more than 1 or 2 standard deviation away for average,
    # first item gets a different check
    for i in range(1, len(y_data)):
        # check dist between pred next point and given current point
        dist = abs(math.dist(y_output[i], y_data[i - 1]))
        if (dist > avg - 0.45 * std) and (dist < avg + 0.45 * std):
            # continue
            y_corrected.append(y_output[i])
        else:
            # take midpoint between predicted and actual
            coord_fix = [0, 0]
            coord_fix[0] = (y_output[i][0] + y_data[i][0]) / 2
            coord_fix[1] = (y_output[i][1] + y_data[i][1]) / 2
            y_corrected.append(coord_fix)

    return y_corrected


def correct_role_rf(y_output, y_data, x_data):
    # check if role is same as current role
    if y_output == y_data:
        return None
    else:
        champID = x_data[2]
        with open("datasets/champions.json", "r") as file:
            data = json.load(file)

        for champ in data:
            if (data[champ]["id"] == champID) and (
                y_output in data[champ]["positions"]
            ):
                return y_output
    return None

    # check if role is available for champ


def correct_champion_rf(y_output, y_data):
    # check if output is same as player current champ
    if y_output == y_data:
        return None
    else:
        return y_output


def run_knn(knn_model, data):
    # x is what we have, y is what we want
    x_data, y_data = converter.format_api_data_knn(data)

    y_output = knn_model.predict(x_data)

    y_output = correct_knn(y_output, y_data)

    return y_output, y_data


def run_rf(rf_model, data, cat):
    # data parameter comes from api
    # cat is "champion", "item", "skill", "role"
    x_data, y_data = converter.format_api_data_rf(data, cat)

    y_output = rf_model.predict(x_data)
    match cat:
        case "champion":
            y_output = correct_champion_rf(y_output, y_data)
        case "role":
            y_output = correct_role_rf(y_output, y_data, x_data)

    return y_output


# knn models now runs on about 75-80%

def get_skill_pred(rf_model, data):
    #TODO: replace with code to pull from db?
    with open("datasets/champions.json", "r") as file:
        data_file = json.load(file)

    y_output = run_rf(rf_model, data, "skill")
    #y_output is skillslot, levelUpType

    skill_id = None
    if y_output != None:
        skill_id = y_output[0]

    champID = data[2]

    abilities = data_file[champID]["abilities"]
    skill = skill_id
    #Slots translate to P, Q, W, E, R
    match skill_id:
        case 1:
            skill = abilities["P"]["name"]
        case 2:
            skill = abilities["Q"]["name"]
        case 3:
            skill = abilities["W"]["name"]
        case 4:
            skill = abilities["E"]["name"]
        case 5:
            skill = abilities["R"]["name"]

    return skill
    #example output: "Look at upgrading [skill] at this point", "It might be good to level [skill] here"

def get_item_name_icon(item_id):
    #TODO: replace with code to pull from db?
    with open("datasets/items.json", "r") as file:
        data = json.load(file)

    item_name = data[item_id]["name"]
    item_icon = data[item_id]["icon"]

    return item_name, item_icon
    #name is for AI output, name + icon is for timeline analysis page
    