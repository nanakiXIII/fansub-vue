# ── Stage 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2 : Serve ───────────────────────────────────────────────────────────
FROM caddy:2.11.4-alpine

WORKDIR /srv

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv

EXPOSE 80 443

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
