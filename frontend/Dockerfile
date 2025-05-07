# ---------- Build Stage ----------
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Copy everything from frontend/
COPY . .

# Install dependencies and build the app
RUN npm install
RUN npm run build

# ---------- Serve Stage ----------
FROM nginx:alpine

# Copy built files to NGINX's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom NGINX config (optional but recommended)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port NGINX will serve from
EXPOSE 3000

# Run NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
