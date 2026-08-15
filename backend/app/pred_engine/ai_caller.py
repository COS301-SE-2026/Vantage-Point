import json
from app.pred_engine import AI_models as ai  # type: ignore

#contains all funtions for frontend to access

def get_skill_pred(rf_model, data):
    #TODO: replace with code to pull from db?
    with open("datasets/champions.json", "r") as file:
        data_file = json.load(file)

    y_output = ai.run_rf(rf_model, data, "skill")
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
    
def get_role_pred():
    print()

def get_champ_pred():
    print()

def get_knn_output(knn_model, data):
    y_output, y_data = ai.run_knn(knn_model, data)

    #y_output is a list on np arrays right now
    y_list = []
    for i in y_output:
        y_list.append(list(i))

    return y_list