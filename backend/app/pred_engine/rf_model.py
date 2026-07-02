from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import GridSearchCV
from sklearn.multioutput import MultiOutputClassifier
import Data_Converter.src.Converter_Main as converter
import pandas as pd
import numpy as np
import time
import warnings
import csv

warnings.filterwarnings("ignore")

fileName = 'test2000.csv'
runCat = 'champion' #champion; item; skill; role;
yVal = 'championId' #championId, itemId; skillSlot; teamPosition;

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
    
    print(grid_search.best_params_.get('max_depth'))
    print(grid_search.best_params_.get('n_estimators'))
    print(grid_search.best_params_.get('min_samples_leaf'))
    print(grid_search.best_params_.get('min_samples_split'))
    print(grid_search.best_params_.get('bootstrap'))

    
    if runCat == 'skill' or runCat == 'role':
        rfMulti = MultiOutputClassifier(model_grid, n_jobs=-1)
        rfMulti.fit(X_train, y_train)
        y_pred_grid = rfMulti.predict(X_test)
        y_pred_grid_Skill = [row[0] for row in y_pred_grid[0:len(y_pred_grid)]]
        y_test_SKill = [row[0] for row in y_test[0:len(y_test)]]
        scores = accuracy_score(y_pred_grid_Skill, y_test_SKill)
        
    else:
        model_grid.fit(X_train, y_train)
        y_pred_grid = model_grid.predict(X_test)
        scores = accuracy_score(y_pred_grid, y_test)
        
    return scores

def giniImportance(rf):
    with open(fileName, 'r') as f:
        data = csv.reader(f)
        feature_names = []
        for row in data:
            for i in row:
                if i == yVal:
                    continue
                if runCat == 'skill':
                    if i == 'levelUpType':
                        continue
                if runCat == "role":
                    if i == 'lane':
                        continue
                feature_names.append(i)
            break

    if runCat == 'skill' or runCat == 'role':
        feature_impts = []
        for clf in rf.estimators_:
            feature_impts.append(clf.feature_importances_)
        importances = np.mean(feature_impts, axis=0)
    else:
        importances = rf.feature_importances_
    
    feature_imp_df = pd.DataFrame({'Feature': feature_names, 'Gini Importance': importances}).sort_values('Gini Importance', ascending=False)
    return feature_imp_df

#done
#returns itemId
def rf_items(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    return accuracy_score(y_pred, y_test), rf


#returns champion id
def rf_champions(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    return accuracy_score(y_pred, y_test), rf
    
#done
#return skillSlot,leveluptype
def rf_skills(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rfMulti = MultiOutputClassifier(rf, n_jobs=-1)

    rfMulti.fit(X_train, y_train)

    y_pred_grid = rfMulti.predict(X_test)

    y_pred_grid_Skill = [row[0] for row in y_pred_grid[0:len(y_pred_grid)]]
    y_test_SKill = [row[0] for row in y_test[0:len(y_test)]]
        
    scores = accuracy_score(y_pred_grid_Skill, y_test_SKill)
    return scores, rfMulti

#done
#return lane/teamPosition
def rf_role(X_train, X_test, y_train, y_test):
    rf = RandomForestClassifier()
    rfMulti = MultiOutputClassifier(rf, n_jobs=-1)
    rfMulti.fit(X_train, y_train)

    y_pred_grid = rfMulti.predict(X_test)

    y_pred_grid_Skill = [row[0] for row in y_pred_grid[0:len(y_pred_grid)]]
    y_test_SKill = [row[0] for row in y_test[0:len(y_test)]]
        
    scores = accuracy_score(y_pred_grid_Skill, y_test_SKill)
    return scores, rfMulti


###### TESTING AND EVALUATION #######

def test_and_eval():
    start = time.time()
    X_train, X_test, y_train, y_test = converter.getTrainTestDataRF(fileName, runCat)
    
    match runCat:
        case 'champion':
            base_ac, rf_model = rf_champions(X_train, X_test, y_train, y_test)
        case 'item':
            base_ac, rf_model = rf_items(X_train, X_test, y_train, y_test)
        case 'skill':
            base_ac, rf_model = rf_skills(X_train, X_test, y_train, y_test)
        case 'role':
            base_ac, rf_model = rf_role(X_train, X_test, y_train, y_test)
    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')

    param_ac = hyperparam_gridSearch(X_train, X_test, y_train, y_test)

    t = time.time()
    print(f'\nTime: {t - start:.2f} seconds')

    feature_dif = giniImportance(rf_model)
    end = time.time()
    print()
    print(f'Final Time: {end - start:.2f} seconds')

    print("")
    print(f'Base accuracy: {base_ac}')
    print(f'Parameter tuned accuracy: {param_ac}')
    print(feature_dif)

def final_train():

    start = time.time()
    X_train, X_test, y_train, y_test = converter.getTrainTestDataRF(fileName, runCat)

    match runCat:
        case 'champion':
            base_ac, rf_model = rf_champions(X_train, X_test, y_train, y_test)
        case 'item':
            rf_model = RandomForestClassifier(max_depth = 10,
                                                n_estimators = 100,
                                                min_samples_leaf = 2,
                                                min_samples_split = 5,
                                                bootstrap = True
                                            )
            rf_model.fit(X_train, y_train)
            y_pred_grid = rf_model.predict(X_test)
            base_ac = accuracy_score(y_pred_grid, y_test)
        case 'skill':
            base_ac, rf_model = rf_skills(X_train, X_test, y_train, y_test)
        case 'role':
            base_ac, rf_model = rf_role(X_train, X_test, y_train, y_test)

    end = time.time()
    print(f'Final Time: {end - start:.2f} seconds')
    print(f'Base accuracy: {base_ac}')

    return rf_model, base_ac

test_and_eval()
#final_train()

#accuracy score as close to 1 as possible
#remove features with the lowest scores