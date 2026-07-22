import rf_model as rf # type: ignore
import knn_model as knn # type: ignore
import Data_Converter.src.Converter_Main as converter  # type: ignore

def create_models():
    champ_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/champ_rf_training.csv', "champion")
    item_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/item_rf_training.csv', "item")
    role_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/role_rf_training.csv', "role")
    skill_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/skill_rf_training.csv', "skill") 

    knn_model = knn.get_knn('/workspaces/backend/app/pred_engine/Training_csv/knn_training.csv')

    return champ_rf, item_rf, role_rf, skill_rf, knn_model

def run_knn(knn_model, data):
    #data parameter comes from api
    x_data, _ = converter.format_api_data_knn(data)

    y_output = knn_model.predict(x_data)
    return y_output


def run_rf(rf_model, data, cat):
    #data parameter comes from api
    #cat is "champion", "item", "skill", "role"
    x_data , _ = converter.format_api_data_rf(data, cat)

    y_output = rf_model.predict(x_data)
    return y_output
