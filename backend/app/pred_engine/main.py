#from app.pred_engine import knn_model as knn, rf_model as rf  # type: ignore
#from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore
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


def create_knn_model():
    knn_model = knn.get_knn(
        "/workspaces/backend/app/pred_engine/Training_csv/knn_training.csv"
    )

    return knn_model

#run functions will cll error correctors
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
def run_knn(knn_model, data):
    # data parameter comes from api
    x_data, y_data = converter.format_api_data_knn(data)

    y_output = knn_model.predict(x_data)
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
