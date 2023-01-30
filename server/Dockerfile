FROM node:19.4-alpine3.17

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

ENV HOST="0.0.0.0"
ENV PORT=8080

COPY . .

EXPOSE 8080

CMD ["node", "./src/index.js"]