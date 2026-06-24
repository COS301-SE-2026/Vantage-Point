import warnings
import Data_Converter.src.Converter_Main as converter
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import GridSearchCV

warnings.filterwarnings("ignore")

#decisions to implement
    #items to buy
    #champion to use
    #perks to upgrade????


## categorical
def rf_items():
    print()


def hyperparam_gridSearch(X_train, X_test, y_train, y_test):
    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5],
        'min_samples_leaf': [1, 2],
        'bootstrap': [True, False]
    }

    grid_search = GridSearchCV(RandomForestClassifier(), param_grid=param_grid, cv=2)
    grid_search.fit(X_train, y_train)

    model_grid = RandomForestClassifier(max_depth = grid_search.best_params_.get('max_depth'),
                                        n_estimators = grid_search.best_params_.get('n_estimators'),
                                        min_samples_leaf = grid_search.best_params_.get('min_samples_leaf'),
                                        min_samples_split = grid_search.best_params_.get('min_samples_split'),
                                        bootstrap = grid_search.best_params_.get('bootstrap')
                                    )
    
    model_grid.fit(X_train, y_train)
    y_pred_grid = model_grid.predict(X_test)

    print(accuracy_score(y_pred_grid, y_test))


def rf_champions(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    print(accuracy_score(y_pred, y_test))
    

def rf_perks():
    print()

X_train, X_test, y_train, y_test = converter.getTrainTestDataRF('test.csv', 'champion')
rf_champions(X_train, X_test, y_train, y_test)
hyperparam_gridSearch(X_train, X_test, y_train, y_test)



#Feature Importance and Dimensionality Reduction
#Hyperparameter Tuning and Model Selection
    #Grid Search
    #Random Search
    #Bayesian Optimization