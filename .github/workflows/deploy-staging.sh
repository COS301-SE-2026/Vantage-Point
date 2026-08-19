# Set the environment variables
set -e
APP_DIR="staging"
BACKUP_DIR="staging_backup"

# If we have come this far then the package has been successfully received
echo "Received new deployment payload..."

# 1. Backup current deployment directory
mkdir -p "$BACKUP_DIR"
rsync -a --delete "$APP_DIR/" "$BACKUP_DIR/"

# 2. Extract new tarball into app directory
echo "Extracting new files..."
tar -xzf "$PAYLOAD_FILE" -C "$APP_DIR"

# 3. Build and restart containers
cd "$APP_DIR"
echo "Building new images..."
podman-compose build

# Attempt to start the new containers
echo "Deploying new containers..."
podman-compose up -d --remove-orphans

# 4. Health Check
echo "Waiting for health checks..."
sleep 15 # The app should not take that long to start, any longer and there is an issue

NGINX_STATUS=$(podman inspect -f '{{.State.Running}}' staging-nginx 2>/dev/null || echo "false")

# The Nginx status indicates whether the deployment was successful
# as it only starts after the backend and frontend are healthy
if [[ "$NGINX_STATUS" = "true" ]]; then
    echo "Deployment successful! Cleaning up old images..."
    podman image prune -f
else
    # If Nginx is down, restore from backup and rebuild
    echo "Deployment failed! Nginx is down. Restoring from backup..."
    rsync -a --delete "$BACKUP_DIR/" "$APP_DIR/"
    cd "$APP_DIR"
    podman-compose build

    # Re-deploy the containers
    podman-compose up -d --remove-orphans
    echo "Rollback execution completed."
    exit 1
fi
