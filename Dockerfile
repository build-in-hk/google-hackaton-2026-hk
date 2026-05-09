FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY server/ ./server/
COPY src/ ./src/
RUN npx vite build

# Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY server/index.ts ./server/index.ts
COPY server/*.ts ./server/
COPY package.json ./

ENV PORT=3001
EXPOSE 3001
CMD ["node", "server/index.ts"]
