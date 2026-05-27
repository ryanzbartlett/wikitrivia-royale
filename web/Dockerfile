FROM node:22-alpine AS build
WORKDIR /app

COPY web/package.json web/package-lock.json ./web/
RUN cd web && npm ci

COPY web/ ./web/
COPY shared/ ./shared/

WORKDIR /app/web
RUN npm run build

FROM nginx:alpine AS serve
COPY --from=build /app/web/dist /usr/share/nginx/html
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
