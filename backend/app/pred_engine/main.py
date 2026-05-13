# AI mapping algorithm

# divide map into grid based on coords and player speed/size
# each block gets a value based on variables
# block get run thru knn to get the next block to move to
# repeat to create optimal path

import knn_model

print(knn_model.run_knn([[0.78182287]]))
