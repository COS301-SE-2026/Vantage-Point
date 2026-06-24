import warnings
import Data_Converter.src.Converter_Main as converter
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score

warnings.filterwarnings("ignore")

#decisions to implement
    #items to buy
    #champion to use
    #perks to upgrade????


## categorical
def rf_items():
    print()

def rf_champions():
    X_train, X_test, y_train, y_test = converter.getTrainTestDataRF('test.csv', 'champion')

    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print("Accuracy:", accuracy)
    

def rf_perks():
    print()


rf_champions()