FROM node:lts-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
#COPY --chown=node:node ./module-overrides ./node_modules

EXPOSE 8080
CMD [ "node", "app.js"]