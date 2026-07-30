from app.pred_engine import knn_model as knn, rf_model as rf  # type: ignore
from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore


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


def run_knn(knn_model, data):
    # data parameter comes from api
    x_data, _ = converter.format_api_data_knn(data)

    y_output = knn_model.predict(x_data)
    return y_output


def run_rf(rf_model, data, cat):
    # data parameter comes from api
    # cat is "champion", "item", "skill", "role"
    x_data, _ = converter.format_api_data_rf(data, cat)

    y_output = rf_model.predict(x_data)
    return y_output
