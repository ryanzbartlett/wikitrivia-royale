# ── Build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci

COPY web/ ./web/
COPY shared/ ./shared/

WORKDIR /app/web
RUN npm run build

# ── Serve ─────────────────────────────────────────────────────────
FROM caddy:alpine AS serve
COPY --from=build /app/web/dist /srv
COPY web/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80 443 443/udp
