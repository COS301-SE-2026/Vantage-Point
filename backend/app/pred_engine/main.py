from app.pred_engine import knn_model as knn, rf_model as rf  # type: ignore
from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore
import json


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

#change to create seperate models for each lane
#"TOP", "MIDDLE", "BOTTOM", "JUNGLE", "NONE"
def create_knn_model():
    knn_top_model = knn.get_knn("")
    knn_mid_model = knn.get_knn("")
    knn_bot_model = knn.get_knn("")
    knn_jung_model = knn.get_knn("")
    knn_none_model = knn.get_knn("")

    knn_models = [knn_top_model, knn_mid_model, knn_bot_model, knn_jung_model, knn_none_model]

    return knn_models

#run functions will call error correctors
def correct_knn(y_output):
    #check dist fom prev location
    #check for obsticles
    print()

def correct_role_rf(y_output, y_data, x_data):
    #check if role is same as current role
    if y_output == y_data:
        return None
    else:
        champID = x_data[2]
        with open("datasets/champions.json", "r") as file:
            data = json.load(file)

        for champ in data:
            if (data[champ]["id"] == champID) and (y_output in data[champ]["positions"]):
                return y_output
    return None
        
    #check if role is available for champ

def correct_champion_rf(y_output, y_data):
    #check if output is same as player current champ
    if y_output == y_data:
        return None
    else:
        return y_output
''
''
#replace with dedicated run function for each lane
def run_knn(knn_models, data):
    # data parameter comes from api
    
    lane_val = []
    data_list = converter.convert_to_rows(data)
    for row in data_list:
        #remove teamPos variable
        row.remove(row[2])
        #get lane value for check
        lane_val.append(row[3])
        #remove lane variable
        row.remove(row[3])
    
    x_data, y_data = converter.format_api_data_knn(data_list)

    #for each row, run based on lane value
    y_output = []
    for i in range(len(lane_val)):
        #"TOP", "MIDDLE", "BOTTOM", "JUNGLE", "NONE"
        match lane_val[i]:
            case "TOP":
                y_output.append(knn_models[0].predict(x_data[i]))
            case "MIDDLE":
                y_output.append(knn_models[1].predict(x_data[i]))
            case "BOTTOM":
                y_output.append(knn_models[2].predict(x_data[i]))
            case "JUNGLE":
                y_output.append(knn_models[3].predict(x_data[i]))
            case "NONE":
                y_output.append(knn_models[4].predict(x_data[i]))

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
