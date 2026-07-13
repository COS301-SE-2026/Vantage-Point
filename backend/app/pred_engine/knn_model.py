from sklearn.neighbors import KNeighborsRegressor  # type: ignore
from sklearn.metrics import mean_squared_error, r2_score  # type: ignore
import Data_Converter.src.Converter_Main as converter  # type: ignore
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import BaggingRegressor  # type: ignore

file_error_text = "Training file not found"
data_error_text = "Error in Converter_Main.py, returning empty datasets"


def optimize_grid_search(file_name):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    y_train, y_test, x_train, x_test = converter.get_train_test_data_knn(file_name)

    # nullcheck data
    if x_train == [] | x_test == [] | y_train == [] | y_test == []:
        print(data_error_text)
        exit()

    parameters = {
        "n_neighbors": range(1, 35),
        "weights": ["uniform", "distance"],
    }
    gridsearch = GridSearchCV(KNeighborsRegressor(), parameters)
    gridsearch.fit(x_train, y_train)  # slow here
    test_preds_grid = gridsearch.predict(x_test)
    test_mse = mean_squared_error(y_test, test_preds_grid)
    test_r2 = r2_score(y_test, test_preds_grid)
    return (
        gridsearch.best_params_["n_neighbors"],
        gridsearch.best_params_["weights"],
        test_mse,
        test_r2,
    )


def optimize_agging(p1, p2, file_name):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    y_train, y_test, x_train, x_test = converter.get_train_test_data_knn(file_name)

    # nullcheck data
    if x_train == [] | x_test == [] | y_train == [] | y_test == []:
        print(data_error_text)
        exit()

    best_k = p1
    best_weights = p2
    bagged_knn = KNeighborsRegressor(n_neighbors=best_k, weights=best_weights)
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100, random_state=None)
    bagging_model.fit(x_train, y_train)  # slow here
    test_preds_grid = bagging_model.predict(x_test)
    test_mse = mean_squared_error(y_test, test_preds_grid)
    test_r2 = r2_score(y_test, test_preds_grid)
    return test_mse, test_r2


def test_predict(file_name):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    y_train, y_test, x_train, x_test = converter.get_train_test_data_knn(file_name)

    # nullcheck data
    if x_train == [] | x_test == [] | y_train == [] | y_test == []:
        print(data_error_text)
        exit()

    # train model
    knn_regressor = KNeighborsRegressor(n_neighbors=5)
    knn_regressor.fit(x_train, y_train)

    # make predictions
    y_pred = knn_regressor.predict(x_test)
    # evaluate model
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    # want lowest possible mse
    # want r2 as close as possible to 1
    return mse, r2


###### FINAL MODEL #######


def get_knn(file_name):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        print(file_error_text)
        exit()

    y_train, _, x_train, _ = converter.get_train_test_data_knn(file_name)

    # nullcheck data
    if x_train == [] | y_train == []:
        print(data_error_text)
        exit()

    bagged_knn = KNeighborsRegressor(n_neighbors=7, weights="distance")
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100, random_state=None)
    bagging_model.fit(x_train, y_train)

    return bagging_model
