FROM node:22

ENV NODE_ENV=production
ENV NODE_PORT=8080

WORKDIR /app

COPY package*.json /app/
RUN npm install --omit=dev

COPY client /app/client
COPY public /app/public
COPY server /app/server
COPY server.js /app/server.js
EXPOSE 8080
CMD node server.js
