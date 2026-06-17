from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
import Data_Converter.src.Converter_Main as converter
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import BaggingRegressor

#get data from Converter_Main
X_train, X_test, y_train, y_test = converter.getTrainTestData("backend/app/pred_engine/Data_Converter/src/test.csv")

# train model
knn_regressor = KNeighborsRegressor(n_neighbors=49)
knn_regressor.fit(X_train, y_train)

def optimizeGridSearch():
    parameters = {
        "n_neighbors": range(1, 50),
        "weights": ["uniform", "distance"],
    }  
    gridsearch = GridSearchCV(KNeighborsRegressor(), parameters)
    gridsearch.fit(X_train, y_train)
    print(gridsearch.best_params_)

    test_preds_grid = gridsearch.predict(X_test)
    test_mse = mean_squared_error(y_test, test_preds_grid) 
    test_r2 = r2_score(y_test, test_preds_grid)
    print(test_mse)
    print(test_r2)

def optimizeBagging():
    best_k = 49
    best_weights = "uniform"
    bagged_knn = KNeighborsRegressor(
        n_neighbors=best_k, weights=best_weights
    )
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100)
    bagging_model.fit(X_train, y_train)

    test_preds_grid = bagging_model.predict(X_test)
    test_mse = mean_squared_error(y_test, test_preds_grid) 
    test_r2 = r2_score(y_test, test_preds_grid)
    print(test_mse)
    print(test_r2)

def testPredict():
    # make prdictions
    y_pred = knn_regressor.predict(X_test)

    # evaluate model
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    # want lowest possible mse
    # want r2 as close as possible to 1
    print(mse) #current = 5073598934.481382
    print(r2) #current = 0.26642693078753066

# value going in to function is in format [[decimal]]
def run_knn(X_val):
    y_out = knn_regressor.predict(X_val)
    return y_out

optimizeBagging()
