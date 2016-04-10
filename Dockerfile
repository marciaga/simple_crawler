FROM nodesource/node:4.2.3

ADD package.json package.json

RUN npm install

ADD . .

CMD node server.js
