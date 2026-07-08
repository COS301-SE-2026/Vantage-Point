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


def hyperparam_gridSearch(X_train, X_test, y_train, y_test, runCat):
    param_grid = {
        "n_estimators": [100, 200],
        "max_depth": [None, 10, 20],
        "min_samples_split": [2, 5],
        "min_samples_leaf": [1, 2],
        "bootstrap": [True, False],
    }

    grid_search = GridSearchCV(RandomForestClassifier(), param_grid=param_grid, cv=2)
    grid_search.fit(X_train, y_train)

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

    if runCat == "skill" or runCat == "role":
        rfMulti = MultiOutputClassifier(model_grid, n_jobs=-1)
        rfMulti.fit(X_train, y_train)
        y_pred_grid = rfMulti.predict(X_test)
        y_pred_grid_Skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
        y_test_SKill = [row[0] for row in y_test[0 : len(y_test)]]
        scores = accuracy_score(y_pred_grid_Skill, y_test_SKill)

    else:
        model_grid.fit(X_train, y_train)
        y_pred_grid = model_grid.predict(X_test)
        scores = accuracy_score(y_pred_grid, y_test)

    return scores


def giniImportance(rf, fileName, runCat, yVal):
    with open(fileName, "r") as f:
        data = csv.reader(f)
        feature_names = []
        for row in data:
            for i in row:
                if i == yVal:
                    continue
                if runCat == "skill":
                    if i == "levelUpType":
                        continue
                if runCat == "role":
                    if i == "lane":
                        continue
                feature_names.append(i)
            break

    if runCat == "skill" or runCat == "role":
        feature_impts = []
        for clf in rf.estimators_:
            feature_impts.append(clf.feature_importances_)
        importances = np.mean(feature_impts, axis=0)
    else:
        importances = rf.feature_importances_

    feature_imp_df = pd.DataFrame(
        {"Feature": feature_names, "Gini Importance": importances}
    ).sort_values("Gini Importance", ascending=False)
    return feature_imp_df


def rf_univariate(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    return accuracy_score(y_pred, y_test), rf


def rf_multivariate(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rfMulti = MultiOutputClassifier(rf, n_jobs=-1)

    rfMulti.fit(X_train, y_train)

    y_pred_grid = rfMulti.predict(X_test)

    y_pred_grid_Skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
    y_test_SKill = [row[0] for row in y_test[0 : len(y_test)]]

    scores = accuracy_score(y_pred_grid_Skill, y_test_SKill)
    return scores, rfMulti



###### TESTING AND EVALUATION #######


def test_and_eval(fileName, runCat):
    X_train, X_test, y_train, y_test = converter.getTrainTestDataRF(fileName, runCat)

    match runCat:
        case "champion":
            base_ac, rf_model = rf_univariate(X_train, X_test, y_train, y_test)
        case "item":
            base_ac, rf_model = rf_univariate(X_train, X_test, y_train, y_test)
        case "skill":
            base_ac, rf_model = rf_multivariate(X_train, X_test, y_train, y_test)
        case "role":
            base_ac, rf_model = rf_multivariate(X_train, X_test, y_train, y_test)

    param_ac = hyperparam_gridSearch(X_train, X_test, y_train, y_test)
    feature_dif = giniImportance(rf_model)

    print("")
    print(f"Base accuracy: {base_ac}")
    print(f"Parameter tuned accuracy: {param_ac}")
    print(feature_dif)


###### FINAL MODELS #######


def final_train(fileName, runCat):
    start = time.time()
    X_train, X_test, y_train, y_test = converter.getTrainTestDataRF(fileName, runCat)

    a = ["champion", "item"]
    b = ["skill", "role"]
    match runCat:
        case c if c in a:
            rf_model = RandomForestClassifier(
                max_depth=10,
                n_estimators=100,
                min_samples_leaf=2,
                min_samples_split=5,
                bootstrap=True,
            )
            rf_model.fit(X_train, y_train)
            y_pred_grid = rf_model.predict(X_test)
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
            rf_model.fit(X_train, y_train)
            y_pred_grid = rf_model.predict(X_test)
            y_pred_grid_Skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
            y_test_SKill = [row[0] for row in y_test[0 : len(y_test)]]
            base_ac = accuracy_score(y_pred_grid_Skill, y_test_SKill)

    end = time.time()
    print()
    print(f"Final Time: {end - start:.2f} seconds")
    return rf_model, base_ac


# runCat = champion, item, skill, role
# return rf_model, base_ac
#rf, ac = final_train("champ_rf_training.csv", "champion")

# to use:
#   coord = rf.predict(input_values)
# Note:
#   skill and role return multivariate models
