FROM oven/bun:latest
WORKDIR /app

COPY server/package.json server/bun.lock ./server/
RUN cd server && bun install --frozen-lockfile

COPY server/ ./server/
COPY shared/ ./shared/

WORKDIR /app/server

EXPOSE 3000
CMD ["bun", "run", "index.ts"]
