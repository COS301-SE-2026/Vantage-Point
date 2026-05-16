# AI mapping algorithm

# divide map into grid based on coords and player speed/size
# each block gets a value based on variables
# block get run thru knn to get the next block to move to
# repeat to create optimal path

from . import knn_model

#player position data get
#run knn model

print(knn_model.run_knn([[0.78182287]]))
