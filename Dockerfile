FROM node:8

ARG HOST
ENV HOST ${HOST}

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 1234

CMD [ "npm", "start" ]