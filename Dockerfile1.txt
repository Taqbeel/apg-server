FROM node:18-alpine AS build

WORKDIR /app

COPY package.json ./

RUN apk update
RUN yarn install

COPY . .

EXPOSE 4000

CMD [ "yarn", "dev" ]