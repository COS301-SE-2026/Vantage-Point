import json
from app.pred_engine import AI_models as ai  # type: ignore

#make models a global thing for this file or store in db
champ_rf = None
item_rf = None 
role_rf = None 
skill_rf = None 
knn_model = None

#contains all funtions for frontend to access
def create_models():
    c = ai.create_rf_models()
    #k = ai.create_knn_model()

    champ_rf = c
    #item_rf = i
    #role_rf = r
    #skill_rf = s
    #knn_model = k

def get_skill_pred(data):
    #TODO: replace with code to pull from db?
    with open("datasets/champions.json", "r") as file:
        data_file = json.load(file)

    y_output = ai.run_rf(skill_rf, data, "skill")
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

def get_item_pred(data):
    y_output = ai.run_rf(item_rf, data, "item")
    item_id = None
    if y_output != None:
        item_id = y_output

    #TODO: replace with code to pull from db?
    with open("datasets/items.json", "r") as file:
        data = json.load(file)

    item_name = data[item_id]["name"]
    item_icon = data[item_id]["icon"]

    return item_name, item_icon
    #name is for AI output, name + icon is for timeline analysis page
    
def get_role_pred(data):
    y_output = ai.run_rf(role_rf, data, "role")
    #gives teampos, lane

    #add check if champ allows this position?
    with open("datasets/champions.json", "r") as file:
        data_file = json.load(file)
    champId = data[2]

    print(y_output) #for testing purposes

    pos, lane = None, None
    if y_output != None:
        pos = y_output[0]
        lane = y_output[1]

    allowed = False
    for i in data_file:
        if i["id"] == champId:
            positions = i["positions"]
            if pos in positions:
                allowed = True

    return pos, lane, allowed
    
def get_champ_pred(data):
    #TODO: replace with code to pull from db?
    with open("datasets/champions.json", "r") as file:
        data_file = json.load(file)

    y_output = ai.run_rf(role_rf, data, "role")
    #gives champId
    
    print(y_output) #for testing purposes
    
    champName = None
    if y_output != None:
        for i in data_file:
            if i["id"] == y_output:
                champName = i

    #returns none if output is invalid
    return champName

def get_knn_output(knn_model, data):
    y_output, _ = ai.run_knn(knn_model, data)

    #y_output is a list on np arrays right now
    y_list = []
    for i in y_output:
        y_list.append(list(i))

    return y_list


#TESTING