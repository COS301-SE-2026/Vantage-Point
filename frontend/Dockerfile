# Build the application
FROM node:20-slim AS builder
WORKDIR /src

# Copy dependency manifests first to leverage Docker caching
COPY package*.json ./
RUN npm i

# Copy the rest of the frontend source code and compile
COPY . .
RUN npm run build

# Move assets to the shared volume
FROM alpine:3.19
WORKDIR /usr/share/nginx/html

# Create a non-root system user and group inside Alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the static production build files from the builder stage
COPY --from=builder /src/dist .

# Fix ownership of the target directory for our new user
RUN chown -R appuser:appgroup /usr/share/nginx/html

# Switch away from root
USER appuser

# When the container starts, copy files into the mounted shared volume.
# Added a mkdir -p for the target_volume to ensure it handles permissions cleanly.
CMD ["sh", "-c", "mkdir -p /target_volume && cp -rf ./* /target_volume/ && echo 'Assets copied!' && sleep infinity"]
