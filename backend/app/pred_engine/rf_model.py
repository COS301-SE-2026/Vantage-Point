from sklearn.ensemble import RandomForestClassifier  # type: ignore
from sklearn.metrics import accuracy_score  # type: ignore
from sklearn.model_selection import GridSearchCV  # type: ignore
from sklearn.multioutput import MultiOutputClassifier  # type: ignore
from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore
import warnings

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

    grid_search = GridSearchCV(
        RandomForestClassifier(random_state=69420),
        param_grid=param_grid,
        cv=2,
        random_state=69420,
    )
    grid_search.fit(x_train, y_train)

    model_grid = RandomForestClassifier(
        max_depth=grid_search.best_params_.get("max_depth"),
        n_estimators=grid_search.best_params_.get("n_estimators"),
        min_samples_leaf=grid_search.best_params_.get("min_samples_leaf"),
        min_samples_split=grid_search.best_params_.get("min_samples_split"),
        bootstrap=grid_search.best_params_.get("bootstrap"),
        max_features="sqrt",
        random_state=69420,
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
        y_test_skill = [row[0] for row in y_test[0 : len(y_test)]]
        scores = accuracy_score(y_pred_grid_skill, y_test_skill)
    else:
        model_grid.fit(x_train, y_train)
        y_pred_grid = model_grid.predict(x_test)
        scores = accuracy_score(y_pred_grid, y_test)

    return scores


def rf_univariate(x_train, x_test, y_train, y_test):
    rf = RandomForestClassifier(
        random_state=69420, min_samples_leaf=1, max_features="sqrt"
    )
    rf.fit(x_train, y_train)

    y_pred = rf.predict(x_test)
    return accuracy_score(y_pred, y_test), rf


def rf_multivariate(x_train, x_test, y_train, y_test):
    rf = RandomForestClassifier(
        random_state=69420, min_samples_leaf=1, max_features="sqrt"
    )
    rf_multi = MultiOutputClassifier(rf, n_jobs=-1)

    rf_multi.fit(x_train, y_train)

    y_pred_grid = rf_multi.predict(x_test)

    y_pred_grid_skill = [row[0] for row in y_pred_grid[0 : len(y_pred_grid)]]
    y_test_skill = [row[0] for row in y_test[0 : len(y_test)]]

    scores = accuracy_score(y_pred_grid_skill, y_test_skill)
    return scores, rf_multi


###### FINAL MODELS #######


def final_train(file_name, run_cat):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        return None

    x_train, x_test, y_train, y_test = converter.get_train_test_data_rf(
        file_name, run_cat
    )

    # nullcheck data
    if len(x_train) == 0 or len(x_test) == 0 or len(y_train) == 0 or len(y_test) == 0:
        return None

    rf_model = None

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
                max_features="sqrt",
                random_state=69420,
            )
            rf_model.fit(x_train, y_train)

        case c if c in b:
            rf = RandomForestClassifier(
                max_depth=None,
                n_estimators=100,
                min_samples_leaf=1,
                min_samples_split=2,
                bootstrap=True,
                max_features="sqrt",
                random_state=69420,
            )
            rf_model = MultiOutputClassifier(rf, n_jobs=-1)
            rf_model.fit(x_train, y_train)

    return rf_model
