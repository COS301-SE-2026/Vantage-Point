# Navigate to the project directory
cd /antage-Point-Prod || exit 1

# Pull the latest main branch onto the server
git pull origin main

# Get the latest Git commit SHA to use as our unique image tag
export IMAGE_TAG=$(git rev-parse --short HEAD)
echo "New Image Tag: $IMAGE_TAG"

# Save the CURRENT (not latest) running tag in case we need to roll back
# If nothing is running yet, defaults to 'latest'
export PREVIOUS_TAG=$(podman inspect --format='{{.Config.Image}}' production-backend 2>/dev/null | cut -d':' -f2 || echo 'latest')
echo "Backup/Previous Tag: $PREVIOUS_TAG"

# Build the new backend and frontend images
echo "Building new images locally..."
podman-compose build

# Attempt to start the new containers
echo "Deploying new containers..."
podman-compose up -d --remove-orphans

# Health Check: Wait and verify if Nginx stayed up and healthy
echo "Waiting for health checks to stabilize..."
sleep 15

NGINX_STATUS=$(podman inspect -f '{{.State.Running}}' production-nginx 2>/dev/null || echo "false")

if [ "$NGINX_STATUS" = "true" ]; then
    echo "Deployment successful! Cleaning up old unused images..."
    podman image prune -f
else
    echo "Deployment failed! Nginx is not running properly."
    echo "Rolling back to previous working version ($PREVIOUS_TAG)..."

    # Re-export the old tag and force podman-compose back to the previous state
    export IMAGE_TAG=$PREVIOUS_TAG
    podman-compose up -d --remove-orphans

    echo "Rollback execution completed."
    exit 1
fi
