from sklearn.neighbors import KNeighborsRegressor  # type: ignore
from sklearn.metrics import r2_score  # type: ignore
from sklearn.ensemble import BaggingRegressor  # type: ignore
from app.pred_engine.Data_Converter.src import Converter_Main as converter  # type: ignore


def test_predict(file_name):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        return None

    y_train, y_test, x_train, x_test = converter.get_train_test_data_knn(file_name)

    # nullcheck data
    if x_train == [] or x_test == [] or y_train == [] or y_test == []:
        return None

    # train model
    knn_regressor = KNeighborsRegressor(n_neighbors=5)
    knn_regressor.fit(x_train, y_train)

    # make predictions
    y_pred = knn_regressor.predict(x_test)
    # evaluate model
    r2 = r2_score(y_test, y_pred)
    # want lowest possible mse
    # want r2 as close as possible to 1
    return r2


###### FINAL MODEL #######


def get_knn(file_name):
    # add file check
    try:
        open(file_name, "r")
    except OSError:
        return None

    x_train, _, y_train, _ = converter.get_train_test_data_knn(file_name)

    # nullcheck data
    if len(x_train) == 0 or len(y_train) == 0:
        return None

    bagged_knn = KNeighborsRegressor(n_neighbors=7, weights="distance")
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100, random_state=69420)
    bagging_model.fit(x_train, y_train)

    return bagging_model
