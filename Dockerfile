FROM node:alpine

WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 1337
CMD [ "npm", "run", "setup", "&&", "npm", "run", "start" ]