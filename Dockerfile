FROM node:14-buster

RUN mkdir /app

WORKDIR /app

COPY . /app/

RUN yarn install