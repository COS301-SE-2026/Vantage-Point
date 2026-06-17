from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
import Data_Converter.src.Converter_Main as converter
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import BaggingRegressor
#add import
from pyloading_bar import Bar

num_step = 20
bar = Bar(num_step)

#get data from Converter_Main
#the x and y is swapped in Converter_Main because I am a moron
#y is what we want
#x is given data
y_train, y_test, X_train, X_test = converter.getTrainTestData("backend/app/pred_engine/Data_Converter/src/test.csv")
bar.next()

# train model
knn_regressor = KNeighborsRegressor(n_neighbors=49)
bar.next()
knn_regressor.fit(X_train, y_train)
bar.next()

def optimizeGridSearch():
    parameters = {
        "n_neighbors": range(1, 50),
        "weights": ["uniform", "distance"],
    }  
    gridsearch = GridSearchCV(KNeighborsRegressor(), parameters)
    bar.next()
    gridsearch.fit(X_train, y_train)
    bar.next()
    test_preds_grid = gridsearch.predict(X_test)
    bar.next()
    test_mse = mean_squared_error(y_test, test_preds_grid) 
    bar.next()
    test_r2 = r2_score(y_test, test_preds_grid)
    bar.next()
    return gridsearch.best_params_["n_neighbors"], gridsearch.best_params_["weights"], test_mse, test_r2

def optimizeBagging(p1,p2):
    best_k = p1
    best_weights = p2
    bagged_knn = KNeighborsRegressor(
        n_neighbors=best_k, weights=best_weights
    )
    bar.next()
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100)
    bar.next()
    bagging_model.fit(X_train, y_train)
    bar.next()
    test_preds_grid = bagging_model.predict(X_test)
    bar.next()
    test_mse = mean_squared_error(y_test, test_preds_grid) 
    bar.next()
    test_r2 = r2_score(y_test, test_preds_grid)
    bar.next()
    return test_mse, test_r2

def testPredict():
    # make prdictions
    y_pred = knn_regressor.predict(X_test)
    bar.next()
    # evaluate model
    mse = mean_squared_error(y_test, y_pred)
    bar.next()
    r2 = r2_score(y_test, y_pred)
    bar.next()
    # want lowest possible mse
    # want r2 as close as possible to 1
    #print(mse) current = 5073598934.481382
    #print(r2) current = 0.26642693078753066
    return mse, r2

# value going in to function is in format [[decimal]]
def run_knn(X_val):
    y_out = knn_regressor.predict(X_val)
    return y_out

mse, r2 = testPredict()
p1, p2, grid_mse, grid_r2 = optimizeGridSearch()
bag_mse, bag_r2 = optimizeBagging()

with open("output.txt", "w", encoding="utf-8") as f:
    f.write("initail results:\n")
    f.write("mse: " + mse + "\n")
    f.write("r2: " + r2 + "\n")
    f.write("\n")
    bar.next()
    f.write("grid optimize results:\n")
    f.write("grid_mse: " + grid_mse + "\n")
    f.write("grid_r2: " + grid_r2 + "\n")
    f.write("\n")
    bar.next()
    f.write("bag optimize results:\n")
    f.write("bag_mse: " + bag_mse + "\n")
    f.write("bag_r2: " + bag_r2 + "\n")
    f.write("\n")
    bar.next()



