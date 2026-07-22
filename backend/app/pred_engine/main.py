import rf_model as rf # type: ignore
import knn_model as knn # type: ignore
import Data_Converter.src.Converter_Main as converter  # type: ignore

def create_rf_models():
    champ_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/champ_rf_training.csv', "champion")
    print("champ model made")
    item_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/item_rf_training.csv', "item")
    print("item model made")
    role_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/role_rf_training.csv', "role")
    print("role model made")
    skill_rf, _ = rf.final_train('/workspaces/backend/app/pred_engine/Training_csv/skill_rf_training.csv', "skill") 
    print("skill model made")

    return champ_rf, item_rf, role_rf, skill_rf

def create_knn_model():
    knn_model = knn.get_knn('/workspaces/backend/app/pred_engine/Training_csv/knn_training.csv')
    print("knn model made")

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

champ_rf, item_rf, role_rf, skill_rf = create_rf_models()
print("models made")

data = [1054,4744,"JUNGLE",15195,16,114,0,1,0,0,500,0,1679,12391,0,0,0,0,0,0,0,0,0,0,0,0,0,33,0,76,100,0,740,740,25,0,0,0,32,345,0,300,300]
y = run_rf(item_rf, data, "item")
print(y)