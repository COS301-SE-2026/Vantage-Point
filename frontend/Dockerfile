# Build the application
FROM node:20-slim AS builder
WORKDIR /src

# Copy dependency manifests first to leverage Docker caching
COPY package*.json ./

# Explicitly tell npm to install the musl-specific native binaries for Linux x64
# This ensures Rolldown fetches the correct enum bindings for Alpine.
RUN npm i

# Copy the rest of the frontend source code and compile
COPY . .
RUN npm run build

# Move assets to the shared volume
FROM alpine:3.19
WORKDIR /usr/share/nginx/html

# Copy the static production build files from the builder stage
COPY --from=builder /src/dist .

# When the container starts, copy files into the mounted shared volume,
CMD ["sh", "-c", "mkdir -p /target_volume && cp -rf ./* /target_volume/ && echo 'Assets copied!' && sleep infinity"]
