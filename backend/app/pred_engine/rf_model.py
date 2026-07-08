from sklearn.ensemble import RandomForestClassifier  # type: ignore
from sklearn.metrics import accuracy_score  # type: ignore
from sklearn.model_selection import GridSearchCV  # type: ignore
from sklearn.multioutput import MultiOutputClassifier  # type: ignore
import Data_Converter.src.Converter_Main as converter  # type: ignore
import pandas as pd
import numpy as np
import warnings
import time
import csv

warnings.filterwarnings("ignore")
file_error_text = "Training file not found"
data_error_text = "Error in Converter_Main.py, returning empty datasets"


def hyperparam_gridsearch(x_train, x_test, y_train, y_test, run_cat):
    param_grid = {
        "n_estimators": [100, 200],
        "max_depth": [None, 10, 20],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2],
        "bootstrap": [True, False],
    }

    grid_search = GridSearchCV(RandomForestClassifier(), param_grid=param_grid, cv=2)
    grid_search.fit(x_train, y_train)

    model_grid = RandomForestClassifier(
        max_depth=grid_search.best_params_.get("max_depth"),
        n_estimators=grid_search.best_params_.get("n_estimators"),
        min_samples_leaf=grid_search.best_params_.get("min_samples_leaf"),
        min_samples_split=grid_search.best_params_.get("min_samples_split"),
        bootstrap=grid_search.best_params_.get("bootstrap"),
    )

    print(grid_search.best_params_.get("max_depth"))
    print(grid_search.best_params_.get("n_estimators"))
    print(grid_search.best_params_.get("min_samples_leaf"))
    print(grid_search.best_params_.get("min_samples_split"))
    print(grid_search.best_params_.get("bootstrap"))

    if run_cat == "skill" or run_cat == "role":
        rf_multi = MultiOutputClassifier(model_grid, n_jobs=-1)
        rf_multi.fit(x_train, y_train)
        y_pred_grid = rf_multi.predict(x_test)
        y_pred_grid_skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
        y_test_sKill = [row[0] for row in y_test[0 : len(y_test)]]
        scores = accuracy_score(y_pred_grid_skill, y_test_sKill)

    else:
        model_grid.fit(x_train, y_train)
        y_pred_grid = model_grid.predict(x_test)
        scores = accuracy_score(y_pred_grid, y_test)

    return scores


def gini_importance(rf, file_name, run_cat, y_val):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    with open(file_name, "r") as f:
        data = csv.reader(f)
        feature_names = []

    if run_cat == "skill" | run_cat == "role":
        for row in data:
            for i in row:
                if i != y_val and i != "levelUpType" and i != "lane":
                    feature_names.append(i)
            break
        
        feature_impts = []
        for clf in rf.estimators_:
            feature_impts.append(clf.feature_importances_)
        importances = np.mean(feature_impts, axis=0)
    else:
        for row in data:
            for i in row:
                if i != y_val:
                    feature_names.append(i)
            break
        importances = rf.feature_importances_

    feature_imp_df = pd.DataFrame(
        {"Feature": feature_names, "Gini Importance": importances}
    ).sort_values("Gini Importance", ascending=False)
    return feature_imp_df


def rf_univariate(x_train, x_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf.fit(x_train, y_train)

    y_pred = rf.predict(x_test)
    return accuracy_score(y_pred, y_test), rf


def rf_multivariate(x_train, x_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf_multi = MultiOutputClassifier(rf, n_jobs=-1)

    rf_multi.fit(x_train, y_train)

    y_pred_grid = rf_multi.predict(x_test)

    y_pred_grid_Skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
    y_test_SKill = [row[0] for row in y_test[0 : len(y_test)]]

    scores = accuracy_score(y_pred_grid_Skill, y_test_SKill)
    return scores, rf_multi


###### TESTING AND EVALUATION #######


def test_and_eval(file_name, run_cat, y_val):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    x_train, x_test, y_train, y_test = converter.getTrainTestDataRF(file_name, run_cat)

    # nullcheck data
    if x_train == [] | x_test == [] | y_train == [] | y_test == []:
        print(data_error_text)
        exit()

    match run_cat:
        case "champion":
            base_ac, rf_model = rf_univariate(x_train, x_test, y_train, y_test)
        case "item":
            base_ac, rf_model = rf_univariate(x_train, x_test, y_train, y_test)
        case "skill":
            base_ac, rf_model = rf_multivariate(x_train, x_test, y_train, y_test)
        case "role":
            base_ac, rf_model = rf_multivariate(x_train, x_test, y_train, y_test)

    param_ac = hyperparam_gridsearch(x_train, x_test, y_train, y_test, run_cat)
    feature_dif = gini_importance(rf_model, file_name, run_cat, y_val)

    print("")
    print(f"Base accuracy: {base_ac}")
    print(f"Parameter tuned accuracy: {param_ac}")
    print(feature_dif)


###### FINAL MODELS #######


def final_train(file_name, run_cat):
    start = time.time()
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    x_train, x_test, y_train, y_test = converter.getTrainTestDataRF(file_name, run_cat)

    # nullcheck data
    if x_train == [] | x_test == [] | y_train == [] | y_test == []:
        print(data_error_text)
        exit()

    a = ["champion", "item"]
    b = ["skill", "role"]
    match run_cat:
        case c if c in a:
            rf_model = RandomForestClassifier(
                max_depth=10,
                n_estimators=100,
                min_samples_leaf=2,
                min_samples_split=5,
                bootstrap=True,
            )
            rf_model.fit(x_train, y_train)
            y_pred_grid = rf_model.predict(x_test)
            base_ac = accuracy_score(y_pred_grid, y_test)

        case c if c in b:
            rf = RandomForestClassifier(
                max_depth=None,
                n_estimators=100,
                min_samples_leaf=1,
                min_samples_split=2,
                bootstrap=True,
            )
            rf_model = MultiOutputClassifier(rf, n_jobs=-1)
            rf_model.fit(x_train, y_train)
            y_pred_grid = rf_model.predict(x_test)
            y_pred_grid_skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
            y_test_skill = [row[0] for row in y_test[0 : len(y_test)]]
            base_ac = accuracy_score(y_pred_grid_skill, y_test_skill)

    end = time.time()
    print()
    print(f"Final Time: {end - start:.2f} seconds")
    return rf_model, base_ac
