FROM node:alpine
COPY . /app
WORKDIR /app
CMD npm run start