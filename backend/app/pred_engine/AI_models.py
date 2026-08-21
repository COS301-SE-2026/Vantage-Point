from pathlib import Path
import json
import math
import numpy as np
from sklearn.ensemble import RandomForestClassifier

import app.pred_engine.knn_model as knn  # type: ignore
import app.pred_engine.rf_model as rf  # type: ignore
from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore

# Define directory constants relative to this file
PRED_ENGINE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = PRED_ENGINE_DIR / "datasets"
TRAINING_CSV_DIR = PRED_ENGINE_DIR / "Training_csv"


# stats function to get distances + deviation
def avg_and_std(y_data):
    if len(y_data) == 0:
        return None, None

    dist = []
    for i in range(0, len(y_data)):
        for j in range(0, len(y_data)):
            if i != j:
                dist.append(abs(math.dist(y_data[i], y_data[j])))

    avg = sum(dist) / len(dist)
    std = np.std(dist, ddof=1)

    return avg, std


def create_rf_models():
    print(">>> Skill RF Started")
    champ_rf = rf.final_train(
        str(TRAINING_CSV_DIR / "champ_rf_training.csv"),
        "champion",
    )
    item_rf = rf.final_train(str(TRAINING_CSV_DIR / "item_rf_training.csv"), "item")
    role_rf = rf.final_train(str(TRAINING_CSV_DIR / "role_rf_training.csv"), "role")
    skill_rf = rf.final_train(
        str(TRAINING_CSV_DIR / "skill_rf_training.csv"),
        "skill",
    )
    print(">>> Skill RF finished", flush=True)

    return champ_rf, item_rf, role_rf, skill_rf


def create_knn_model():
    knn_models = knn.get_knn(str(TRAINING_CSV_DIR / "knn_training.csv"))
    return knn_models

# run functions will call error correctors
def correct_knn(y_output, y_data):

    # get average dist between y_data points
    avg, std = avg_and_std(y_data)
    if avg is None or std is None:
        return None
    y_corrected = []

    y_corrected.append(y_data[0])

    # if more than 1 or 2 standard deviation away for average,
    # first item gets a different check
    for i in range(1, len(y_data)):
        # check dist between pred next point and given current point
        dist = abs(math.dist(y_output[i], y_data[i - 1]))
        if (dist > avg - 0.45 * std) and (dist < avg + 0.45 * std):
            # continue
            y_corrected.append(y_output[i])
        else:
            # take midpoint between predicted and actual
            coord_fix = [0, 0]
            coord_fix[0] = (y_output[i][0] + y_data[i][0]) / 2
            coord_fix[1] = (y_output[i][1] + y_data[i][1]) / 2
            y_corrected.append(coord_fix)

    return y_corrected


def correct_role_rf(y_output, y_data, x_data):
    # check if role is same as current role
    if y_output[0][0] == y_data[0][0] and y_output[0][1] == y_data[0][1]:
        return None
    else:
        champID = x_data[0][0]
        champions_path = DATASETS_DIR / "champions.json"
        with open(champions_path, "r") as file:
            data = json.load(file)

        # translate y_output back to text (pos, lane)
        pos = y_output[0][0]
        lane = y_output[0][1]
        out = []
        match pos:
            case 1:
                out.append("TOP")
            case 2:
                out.append("JUNGLE")
            case 3:
                out.append("MIDDLE")
            case 4:
                out.append("BOTTOM")
            case 5:
                out.append("UTILITY")
        match lane:
            case 1:
                out.append("TOP")
            case 2:
                out.append("MIDDLE")
            case 3:
                out.append("BOTTOM")
            case 4:
                out.append("JUNGLE")
            case 5:
                out.append("NONE")

        for champ in data:
            if (data[champ]["id"] == champID) and (out[0] in data[champ]["positions"]):
                return out
        return None


def correct_champion_rf(y_output, y_data):
    # check if output is same as player current champ
    if y_output == y_data:
        return None
    else:
        return y_output


def run_knn(knn_model, data):
    # x is what we have, y is what we want
    x_data, y_data = converter.format_api_data_knn(data)

    y_output = knn_model.predict(x_data)

    y_output = correct_knn(y_output, y_data)

    return y_output, y_data


def run_rf(rf_model, data, cat):
    x_data, y_data = converter.format_api_data_rf(data, cat)

    # flatten nested elements and normalize list items
    cleaned_x = []
    for sample in x_data:
        if isinstance(sample, (list, tuple, np.ndarray)):
            flat_sample = np.array(sample, dtype=object).flatten().tolist()
        else:
            flat_sample = [sample]
        cleaned_x.append(flat_sample)

    # pad ragged feature rows to a same length
    max_len = max(len(row) for row in cleaned_x) if cleaned_x else 0
    padded_x = [
        row + [0.0] * (max_len - len(row)) for row in cleaned_x
    ]
    x_matrix = np.array(padded_x, dtype=np.float64)

    if x_matrix.ndim == 1:
        x_matrix = x_matrix.reshape(1, -1)

    # align input dimensions with the rf model
    expected_features = getattr(rf_model, "n_features_in_", None)
    if expected_features is not None:
        if x_matrix.shape[1] > expected_features:
            x_matrix = x_matrix[:, :expected_features]
        elif x_matrix.shape[1] < expected_features:
            x_matrix = np.pad(
                x_matrix,
                ((0, 0), (0, expected_features - x_matrix.shape[1])),
                mode="constant"
            )

    y_output = rf_model.predict(x_matrix)

    # category-specific adjustments
    if cat == "champion":
        y_output = correct_champion_rf(y_output, y_data)
    elif cat == "role":
        corrected = correct_role_rf(y_output, y_data, x_matrix)
        if corrected is not None:
            y_output = corrected

    return y_output

# knn models now runs on about 75-80%
