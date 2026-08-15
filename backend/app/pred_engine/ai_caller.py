import json
import AI_models as ai  # type: ignore

# make models a global thing for this file or store in db
champ_rf = None
item_rf = None
role_rf = None
skill_rf = None
knn_model = None


# contains all funtions for frontend to access
def create_models():
    c, i, r, s = ai.create_rf_models()
    k = ai.create_knn_model()

    return c, i, r, s, k


def get_skill_pred(data):
    with open(
        "/workspaces/backend/app/pred_engine/datasets/champions.json", "r"
    ) as file:
        data_file = json.load(file)

    y_output = ai.run_rf(skill_rf, data, "skill")
    # y_output is skillslot, levelUpType

    skill_id = None
    if y_output is None:
        return y_output
    else:
        skill_id = list(y_output)[0][0]

    champID = data[0][2]
    for i in data_file:
        if data_file[i]["id"] == champID:
            champName = i

    abilities = data_file[champName]["abilities"]
    skill = skill_id
    # Slots translate to P, Q, W, E, R
    match skill_id:
        case 1:
            skill = abilities["P"][0]["name"]
        case 2:
            skill = abilities["Q"][0]["name"]
        case 3:
            skill = abilities["W"][0]["name"]
        case 4:
            skill = abilities["E"][0]["name"]
        case 5:
            skill = abilities["R"][0]["name"]

    return skill
    # example output: "Look at upgrading [skill] at this point", "It might be good to level [skill] here"


def get_item_pred(data):
    y_output = ai.run_rf(item_rf, data, "item")
    item_id = None
    if y_output is None:
        return None, None
    else:
        item_id = list(y_output)[0]

    with open("/workspaces/backend/app/pred_engine/datasets/items.json", "r") as file:
        data_file = json.load(file)

    item_name = data_file[str(item_id)]["name"]
    item_icon = data_file[str(item_id)]["icon"]

    return item_name, item_icon
    # name is for AI output, name + icon is for timeline analysis page


def get_role_pred(data):
    y_output = ai.run_rf(role_rf, data, "role")
    # gives teampos, lane

    print(y_output)  # for testing purposes

    pos, lane = None, None
    if y_output is None:
        return None
    else:
        pos = y_output[0]
        lane = y_output[1]

    return pos, lane


def get_champ_pred(data):
    with open(
        "/workspaces/backend/app/pred_engine/datasets/champions.json", "r"
    ) as file:
        data_file = json.load(file)

    y_output = ai.run_rf(champ_rf, data, "champion")
    # gives champId

    champName = None
    if y_output is None:
        return champName
    else:
        for i in data_file:
            if data_file[i]["id"] == y_output:
                champName = i

    # returns none if output is same as player champId
    return champName


def get_knn_output(knn_model, data):
    y_output, _ = ai.run_knn(knn_model, data)

    # y_output is a list on np arrays right now
    y_list = []
    for i in y_output:
        y_list.append(list(i))

    return y_list


champ_rf, item_rf, role_rf, skill_rf, knn_model = create_models()
