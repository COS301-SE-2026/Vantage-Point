# Build the application
FROM node:20-alpine AS builder
WORKDIR /src

# Copy dependency manifests first to leverage Docker caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code and compile
COPY . .
RUN npm run build

# Move assets to the shared volume
FROM alpine:3.19
WORKDIR /usr/share/nginx/html

# Copy the static production build files from the builder stage
COPY --from=builder /src/dist .

# When the container starts, copy files into the mounted shared volume,
# then echo a success message and exit.
CMD ["sh", "-c", "cp -r ./* /target_volume/ && echo 'Frontend assets synced successfully!'"]
