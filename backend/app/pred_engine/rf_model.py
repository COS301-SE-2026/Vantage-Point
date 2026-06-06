import pandas as pd
import numpy as np
import warnings

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import RandomizedSearchCV, train_test_split

warnings.filterwarnings('ignore')

#categorical
def rf_categorical():
    #map words to numbers
    bank_data['default'] = bank_data['default'].map({'no':0,'yes':1,'unknown':0})
    bank_data['y'] = bank_data['y'].map({'no':0,'yes':1})

    # Split the data into features (X) and target (y)
    X = bank_data.drop('y', axis=1)
    y = bank_data['y']

    # Split the data into training and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    #fitting
    rf = RandomForestClassifier()
    rf.fit(X_train, y_train)

    #run
    y_pred = rf.predict(X_test)

    #evaluate
    accuracy = accuracy_score(y_test, y_pred)
    print("Accuracy:", accuracy)


#regression
def rf_regression():
    #temp dataset to test code logic
    df= pd.read_csv('/content/Position_Salaries.csv')

    #data features
    x = df.iloc[:,1:2].values
    #target variable
    y = df.iloc[:,2].values

    #encode categorical data as numeric
    label_encoder = LabelEncoder()
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = label_encoder.fit_transform(df[col])

    #dataset splitting
    X_train, X_test, y_train, y_test = train_test_split(
        x, y,
        test_size=0.2,
        random_state=42
    )

    #training
    regressor = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        oob_score=True
    )
    regressor.fit(X_train, y_train)

    #run
    print("Out-of-Bag Score:", regressor.oob_score_)
    y_pred = regressor.predict(X_test)

    #evaluate
    mse = mean_squared_error(y_test, y_pred)
    print("Mean Squared Error:", mse)
    r2 = r2_score(y_test, y_pred)
    print("R-squared:", r2)