FROM node:14

RUN mkdir -p /app
WORKDIR /app

COPY ./ /app

RUN yarn install

EXPOSE 3000

CMD ["node", "dist/main"]
