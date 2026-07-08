from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
import Data_Converter.src.Converter_Main as converter  # type: ignore
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import BaggingRegressor  # type: ignore


def optimizeGridSearch():
    y_train, y_test, X_train, X_test = converter.getTrainTestDataKNN("test200000.csv")
    parameters = {
        "n_neighbors": range(1, 35),
        "weights": ["uniform", "distance"],
    }
    gridsearch = GridSearchCV(KNeighborsRegressor(), parameters)
    gridsearch.fit(X_train, y_train)  # slow here
    test_preds_grid = gridsearch.predict(X_test)
    test_mse = mean_squared_error(y_test, test_preds_grid)
    test_r2 = r2_score(y_test, test_preds_grid)
    return (
        gridsearch.best_params_["n_neighbors"],
        gridsearch.best_params_["weights"],
        test_mse,
        test_r2,
    )


def optimizeBagging(p1, p2):
    y_train, y_test, X_train, X_test = converter.getTrainTestDataKNN("test200000.csv")
    best_k = p1
    best_weights = p2
    bagged_knn = KNeighborsRegressor(n_neighbors=best_k, weights=best_weights)
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100)
    bagging_model.fit(X_train, y_train)  # slow here
    test_preds_grid = bagging_model.predict(X_test)
    test_mse = mean_squared_error(y_test, test_preds_grid)
    test_r2 = r2_score(y_test, test_preds_grid)
    return test_mse, test_r2


def testPredict():
    y_train, y_test, X_train, X_test = converter.getTrainTestDataKNN("test200000.csv")
    # train model
    knn_regressor = KNeighborsRegressor(n_neighbors=5)
    knn_regressor.fit(X_train, y_train)

    # make predictions
    y_pred = knn_regressor.predict(X_test)
    # evaluate model
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    # want lowest possible mse
    # want r2 as close as possible to 1
    return mse, r2


###### FINAL MODEL #######


def getKnn(fileName):
    # get data from Converter_Main
    y_train, y_test, X_train, X_test = converter.getTrainTestDataKNN(fileName)

    bagged_knn = KNeighborsRegressor(n_neighbors=7, weights="distance")
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100)
    bagging_model.fit(X_train, y_train)

    return bagging_model


# return knn_model
knn = getKnn("test200000.csv")
# to use:
#   coord = knn.predict(input_values)
# Note:
#   returns both x and y value
