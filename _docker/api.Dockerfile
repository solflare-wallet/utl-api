FROM node:17.4

WORKDIR /app

COPY package.json .

RUN npm i --production

COPY . .

EXPOSE 80

CMD npm run start:api
