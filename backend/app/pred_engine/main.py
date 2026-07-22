import rf_model as rf # type: ignore
import knn_model as knn # type: ignore
import Data_Converter.src.Converter_Main as converter  # type: ignore

def create_rf_models():
    champ_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/champ_rf_training.csv', "champion")
    item_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/item_rf_training.csv', "item")
    role_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/role_rf_training.csv', "role")
    skill_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/skill_rf_training.csv', "skill") 

    return champ_rf, item_rf, role_rf, skill_rf

def create_knn_model():
    knn_model = knn.get_knn('/workspaces/backend/app/pred_engine/Training_csv/knn_training.csv')

    return knn_model

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

data = [
    2424,12488,'TOP','NONE','DUO',360179,2153,12682,3267,13137,9172,12,23,921,3,18,0,2,9,6,47,10458,3036,13718,2081,2602,0,0,51,115,129,0,0,1169,1187,24,0,370,100,100,13364,2619,2535,1977,11974,2446,3297,2573,12460,2611,11780,3647,7275,7840,13232,3327,12555,2629
]
y = run_knn(create_knn_model(), data)
print(y)