import json
import app.pred_engine.AI_models as ai  # type: ignore

# make models a global thing for this file or store in db


# contains all funtions for frontend to access
def create_models():
    c, i, r, s = ai.create_rf_models()
    k = ai.create_knn_model()

    global champ_rf
    champ_rf = c
    global item_rf
    item_rf = i
    global role_rf
    role_rf = r
    global skill_rf
    skill_rf = s
    global knn_model
    knn_model = k


def get_skill_pred(data):
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


def get_item_pred(data):
    global item_rf
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


def get_role_pred(data):
    global role_rf
    y_output = ai.run_rf(role_rf, data, "role")
    # gives teampos, lane

    pos, lane = None, None
    if y_output is None:
        return None, None
    else:
        pos = y_output[0]
        lane = y_output[1]

    return pos, lane


def get_champ_pred(data):
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
