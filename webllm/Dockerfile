# Stage 1: Build the application
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
# Vite builds into the 'dist' directory by default
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: Copy a custom nginx config if you have one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 6000
CMD ["nginx", "-g", "daemon off;"]
