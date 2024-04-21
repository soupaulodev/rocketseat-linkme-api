FROM node:20.12.1-alpine

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]
COPY ./src ./src

RUN rm -rf node_modules \
    && rm -rf dist \
    && npm install \
    && npm run build

EXPOSE 3000
CMD npm run start