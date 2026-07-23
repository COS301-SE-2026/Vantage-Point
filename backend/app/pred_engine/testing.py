import rf_model as rf # type: ignore
import knn_model as knn # type: ignore
import Data_Converter.src.Converter_Main as converter  # type: ignore

def create_knn_model():
    knn_model = knn.get_knn('/workspaces/backend/app/pred_engine/Training_csv/knn_training.csv')

    return knn_model

def knn_normalizer(knn_model, data):
    #error control for knn model output
    #figure out average dist between x and y values of given data
    coord = []
    for row in data:
        #first 2 values is (x,y)
        x = row[0]
        y = row[1]
        coord.append([x, y])

    
    #check dif between predicted values
    #fix as needed
    print()