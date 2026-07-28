# Save the current tag for rollback
PREVIOUS_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "initial")
echo "Backup/Previous Git hash: $PREVIOUS_HASH"

# Pull the new code from GitHub
echo "Pulling new code..."
git pull origin staging

# Build the new backend and frontend images
echo "Building new images locally..."
podman-compose build

# Attempt to start the new containers
echo "Deploying new containers..."
podman-compose up -d --remove-orphans

# Health Check: Wait and verify if Nginx started up and is healthy
echo "Waiting for health checks to stabilize..."
sleep 15

NGINX_STATUS=$(podman inspect -f '{{.State.Running}}' staging-nginx 2>/dev/null || echo "false")

if [[ "$NGINX_STATUS" = "true" ]]; then
    echo "Deployment successful! Cleaning up old unused images..."
    podman image prune -f
else
    echo "Deployment failed! Nginx is not running properly."
    echo "Rolling back to previous working version ($PREVIOUS_HASH)..."

    # Hard reset the local directory back to the working commit
    git reset --hard "$PREVIOUS_HASH"

    # Re-build with stable files
    echo "Re-building with stable files..."
    podman-compose build

    # Re-deploy the containers
    podman-compose up -d --remove-orphans

    echo "Rollback execution completed."
    exit 1
fi
