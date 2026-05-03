# syntax=docker/dockerfile:1.7

# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest and build.
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM caddy:2-alpine
COPY --from=build /app/dist /usr/share/caddy
COPY deploy/Caddyfile /etc/caddy/Caddyfile

EXPOSE 8080

# Caddy reads /etc/caddy/Caddyfile by default; our Caddyfile binds :8080.
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O - http://0.0.0.0:8080/ > /dev/null || exit 1
