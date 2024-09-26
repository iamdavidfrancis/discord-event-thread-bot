FROM node:current-alpine as build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:current-alpine
LABEL maintainer="David Francis <david@iamdavidfrancis.com>"
LABEL org.opencontainers.image.source="https://github.com/iamdavidfrancis/discord-event-thread-bot"

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

CMD ["node", "dist/index.js"]