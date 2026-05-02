from sklearn.datasets import make_regression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score

# temp dataset to get the code functional
X, y = make_regression(n_samples=200, n_features=1, noise=0.1, random_state=42)

# split the dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

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


# value going in to function is in format [[decimal]]
def run_knn(X_val):
    y_out = knn_regressor.predict(X_val)
    return y_out
