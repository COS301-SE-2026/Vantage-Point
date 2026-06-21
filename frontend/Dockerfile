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
RUN apk add --no-cache rsync

# Create a non-root system user and group inside Alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup -s /bin/sh

# Copy the static production build files from the builder stage
COPY --from=builder /src/dist .

# Fix ownership of the target directory for our new user
RUN chown -R appuser:appgroup /usr/share/nginx/html

# When the container starts, copy files into the mounted shared volume.
CMD ["sh", "-c", "\
  echo 'Syncing and cleaning assets...' && \
  rsync -av --delete /usr/share/nginx/html/ /target_volume/ && \
  chown -R appuser:appgroup /target_volume && \
  echo 'Assets copied!' && \
  su appuser -c 'sleep infinity'"]
