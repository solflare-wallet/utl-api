FROM node:17.4

WORKDIR /app

COPY package.json .

RUN npm i --production

COPY . .

RUN npx prisma generate --schema ./prisma/schema.prisma

EXPOSE 80

CMD npm run start:cron
