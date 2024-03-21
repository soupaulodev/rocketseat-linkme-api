FROM node:20

WORKDIR /usr/src/app

COPY . .
RUN npm install

EXPOSE 1337
CMD [ "npm", "run", "setup", "&&", "npm", "run", "start" ]