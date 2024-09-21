FROM node:current-alpine as build
LABEL maintainer="David Francis <david@iamdavidfrancis.com>"

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:current-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

VOLUME ["./data"]

CMD ["node", "dist/index.js"]