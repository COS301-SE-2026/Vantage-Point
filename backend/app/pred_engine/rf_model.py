import warnings
import csv
import Data_Converter.src.Converter_Main as converter
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import GridSearchCV
import pandas as pd
import time
warnings.filterwarnings("ignore")

fileName = 'test.csv'

#evaluation/tuning

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

    return accuracy_score(y_pred_grid, y_test)

def giniImportance(rf):
    with open(fileName, 'r') as f:
        data = csv.reader(f)
        feature_names = []
        for row in data:
            for i in row:
                if i == 'championId':
                    continue
                feature_names.append(i)
            break
    importances = rf.feature_importances_
    feature_imp_df = pd.DataFrame({'Feature': feature_names, 'Gini Importance': importances}).sort_values('Gini Importance', ascending=False)
    return feature_imp_df

#decisions to implement
    #items to buy
    #champion to use
    #perks to upgrade????
## categorical
def rf_items():
    print()


def rf_champions(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    return accuracy_score(y_pred, y_test), rf
    

def rf_perks():
    print()

start = time.time()

X_train, X_test, y_train, y_test = converter.getTrainTestDataRF(fileName, 'champion')
base_ac, rf_model = rf_champions(X_train, X_test, y_train, y_test)
t = time.time()
print(f'\nTime: {t - start:.2f} seconds')

#param_ac = hyperparam_gridSearch(X_train, X_test, y_train, y_test)
#t = time.time()
#print(f'\nTime: {t - start:.2f} seconds')

feature_dif = giniImportance(rf_model)
end = time.time()
print(f'Final Time: {end - start:.2f} seconds')

print("")
print(f'Base accuracy: {base_ac}')
#print(f'Parameter tuned accuracy: {param_ac}')
print(feature_dif)


#Feature Importance and Dimensionality Reduction
#Hyperparameter Tuning and Model Selection
    #Grid Search
    #Random Search
    #Bayesian Optimization