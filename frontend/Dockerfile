# Build the application
FROM node:20-alpine AS builder
WORKDIR /src

# Copy dependency manifests first to leverage Docker caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the frontend source code and compile
COPY . .
RUN npm run build

# Serve the compiled static assets
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Clean the default static files out of Nginx
RUN rm -rf ./*

# Copy the static production build files
COPY --from=builder /src/dist .

# Expose Nginx port 80 internally
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
