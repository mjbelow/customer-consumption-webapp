FROM node:12.14.1-buster-slim as build

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY package.json .
RUN ["npm", "install"]

COPY . .
RUN ["npm", "run", "build"]

FROM nginx:1.20.1 as base
COPY --from=build /opt/app/dist /usr/share/nginx/html
