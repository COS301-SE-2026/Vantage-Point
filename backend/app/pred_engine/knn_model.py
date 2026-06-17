from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
import Data_Converter.src.Converter_Main as converter

#get data from Converter_Main
X_train, X_test, y_train, y_test = converter.getTrainTestData("backend/app/pred_engine/Data_Converter/src/test.csv")

# train model
knn_regressor = KNeighborsRegressor(n_neighbors=5)
knn_regressor.fit(X_train, y_train)

# make prdictions
y_pred = knn_regressor.predict(X_test)

# evaluate model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
# want lowest possible mse
# want r2 as close as possible to 1
print(mse) #current = 5844274936.581176
print(r2) #current = 0.14841359460776338

# value going in to function is in format [[decimal]]
def run_knn(X_val):
    y_out = knn_regressor.predict(X_val)
    return y_out
