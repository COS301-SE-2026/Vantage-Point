import json
from pathlib import Path

import app.pred_engine.AI_models as ai  # type: ignore

import numpy as np
from typing import Any

# Define directory constants relative to this file
PRED_ENGINE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = PRED_ENGINE_DIR / "datasets"

# make models a global thing for this file or store in db


# contains all funtions for frontend to access
def create_models():
    c, i, r, s = ai.create_rf_models()
    # k = ai.create_knn_model()

    global champ_rf
    champ_rf = c
    global item_rf
    item_rf = i
    global role_rf
    role_rf = r
    global skill_rf
    skill_rf = s
    # global knn_model
    # knn_model = k


def get_skill_pred(data) -> Any:
    global skill_rf
    champions_path = DATASETS_DIR / "champions.json"
    with open(champions_path, "r") as file:
        data_file = json.load(file)

    y_output = ai.run_rf(skill_rf, data, "skill")
    # y_output is skillslot, levelUpType

    skill_id = None
    if y_output is None:
        return y_output
    else:
        skill_id = list(y_output)[0][0]

    champID = data[0][2]
    champName = None
    for i in data_file:
        if data_file[i]["id"] == champID:
            champName = i

    if not champName:
        return None

    abilities = data_file[champName]["abilities"]
    skill = skill_id
    # Slots translate to Q, W, E, R
    match skill_id:
        case 1:
            skill = abilities["Q"][0]["name"]
        case 2:
            skill = abilities["W"][0]["name"]
        case 3:
            skill = abilities["E"][0]["name"]
        case 4:
            skill = abilities["R"][0]["name"]

    return skill
    # example output: "Look at upgrading [skill] at this point", "It might be good to level [skill] here"


def get_item_pred(data) -> Any:
    global item_rf
    if not data.itemId:
        return None, None
    
    y_output = ai.run_rf(item_rf, data=data, cat="item")
    item_id = None
    if y_output is None:
        return None, None
    else:
        item_id = list(y_output)[0]

    items_path = DATASETS_DIR / "items.json"
    with open(items_path, "r") as file:
        data_file = json.load(file)

    item_name = data_file[str(item_id)]["name"]
    item_icon = data_file[str(item_id)]["icon"]

    return item_name, item_icon
    # name is for AI output, name + icon is for timeline analysis page

POSITION_MAP = {
    0: "TOP",
    1: "JUNGLE",
    2: "MIDDLE",
    3: "BOTTOM",
    4: "UTILITY"
}

LANE_MAP = {
    0: "TOP",
    1: "JUNGLE",
    2:"MIDDLE",
    3: "BOTTOM",
    4: "NONE"
}

def get_role_pred(data) -> tuple[str | None, str | None]:
    global role_rf
    y_output = ai.run_rf(role_rf, data, "role")

    if y_output is None or len(y_output) == 0:
        return None, None
    
    if isinstance(y_output, np.ndarray) and y_output.ndim > 1:
        row = y_output[0]
        raw_pos = row[0].item() if len(row) > 0 and hasattr(row[0], "item") else row[0]
        raw_lane = row[1].item() if len(row) > 1 and hasattr(row[1], "item") else row[1]
    elif len(y_output) > 2:
        raw_pos = y_output[0].item() if hasattr(y_output[0], "item") else y_output[0]
        raw_lane = y_output[1].item() if hasattr(y_output[1], "item") else y_output[1]
    else:
        return None, None

    pos = POSITION_MAP.get(int(raw_pos), str(raw_pos)) if raw_pos is not None else None
    lane = LANE_MAP.get(int(raw_lane), str(raw_lane)) if raw_lane is not None else None

    return pos, lane


def get_champ_pred(data) -> Any:
    global champ_rf
    champions_path = DATASETS_DIR / "champions.json"
    with open(champions_path, "r") as file:
        data_file = json.load(file)

    y_output = ai.run_rf(champ_rf, data, "champion")
    # gives champId

    # returns none if output is same as player champId or is invalid
    if y_output is None:
        return None
    else:
        champName = None
        for i in data_file:
            if data_file[i]["id"] == y_output:
                champName = i
        # returns none if output is same as player champId
        return champName


def get_knn_output(data):
    global knn_model
    y_output, _ = ai.run_knn(knn_model, data)

    # y_output is a list on np arrays right now
    y_list = []
    for i in y_output:
        coord = []
        for j in i:
            coord.append(getattr(j, "tolist", lambda: j)())
        y_list.append(coord)

    return y_list
