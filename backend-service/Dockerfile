FROM node:alpine

WORKDIR /usr/app

COPY ./package.json ./package.json

RUN npm cache clean --force && npm install 

COPY . .

CMD ["npm", "start"]