from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
import Data_Converter.src.Converter_Main as converter
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import BaggingRegressor
#add import
from pyloading_bar import Bar

import time

start = time.time()

num_step = 20
bar = Bar(num_step)

#get data from Converter_Main
#the x and y is swapped in Converter_Main because I am a moron
#y is what we want
#x is given data
y_train, y_test, X_train, X_test = converter.getTrainTestDataKNN("test.csv")
bar.next() #5%

# train model
knn_regressor = KNeighborsRegressor(n_neighbors=5)
bar.next() #10%
knn_regressor.fit(X_train, y_train)
bar.next() #15%
t = time.time()
print(f'\nTime: {t - start:.2f} seconds')

def optimizeGridSearch():
    parameters = {
        "n_neighbors": range(1, 35),
        "weights": ["uniform", "distance"],
    }  
    gridsearch = GridSearchCV(KNeighborsRegressor(), parameters) 
    bar.next() #35%
    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')
    gridsearch.fit(X_train, y_train) #slow here
    bar.next() #40%
    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')
    test_preds_grid = gridsearch.predict(X_test)
    bar.next() #45%
    test_mse = mean_squared_error(y_test, test_preds_grid) 
    bar.next() #50%
    test_r2 = r2_score(y_test, test_preds_grid)
    bar.next() #55%
    return gridsearch.best_params_["n_neighbors"], gridsearch.best_params_["weights"], test_mse, test_r2

def optimizeBagging(p1,p2):
    best_k = p1
    best_weights = p2
    bagged_knn = KNeighborsRegressor(
        n_neighbors=best_k, weights=best_weights
    )
    bar.next() #60%
    bagging_model = BaggingRegressor(bagged_knn, n_estimators=100)
    bar.next() #65%
    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')
    bagging_model.fit(X_train, y_train) #slow here
    bar.next() #70%
    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')
    test_preds_grid = bagging_model.predict(X_test)
    bar.next() #75%
    test_mse = mean_squared_error(y_test, test_preds_grid) 
    bar.next() #80%
    test_r2 = r2_score(y_test, test_preds_grid)
    bar.next() #85%
    return test_mse, test_r2

def testPredict():
    # make predictions
    y_pred = knn_regressor.predict(X_test)
    bar.next() #20%
    # evaluate model
    mse = mean_squared_error(y_test, y_pred)
    bar.next() #35%
    r2 = r2_score(y_test, y_pred)
    bar.next() #30%
    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')
    # want lowest possible mse
    # want r2 as close as possible to 1
    return mse, r2

# value going in to function is in format [[decimal]]
def run_knn(X_val):
    y_out = knn_regressor.predict(X_val)
    return y_out

mse, r2 = testPredict()
p1, p2, grid_mse, grid_r2 = optimizeGridSearch()
bag_mse, bag_r2 = optimizeBagging(p1, p2)

with open("output.txt", "w", encoding="utf-8") as f:
    f.write("initail results:\n")
    f.write("mse: " + str(mse) + "\n")
    f.write("r2: " + str(r2) + "\n")
    f.write("\n")
    bar.next() #90%
    f.write("grid optimize results:\n")
    f.write("grid_mse: " + str(grid_mse) + "\n")
    f.write("grid_r2: " + str(grid_r2) + "\n")
    f.write("\n")
    bar.next() #95%
    f.write("bag optimize results:\n")
    f.write("bag_mse: " + str(bag_mse) + "\n")
    f.write("bag_r2: " + str(bag_r2) + "\n")
    f.write("\n")
    bar.next() #100%

end = time.time()
print('')
print('')
print(f'Final Time: {end - start:.2f} seconds')

##################################################
#results with 20000 rows
# about double the runs with 2000 rows

#initail results:
#mse: 11680512.064259995
#r2: 0.2801380122572488

#grid optimize results:
#grid_mse: 11023449.667127294
#grid_r2: 0.3204628019463509

#bag optimize results:
#bag_mse: 10956324.517077383
#bag_r2: 0.32458748375109797
