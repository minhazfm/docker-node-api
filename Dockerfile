FROM node:10.16.0-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk add \
    python \
    make \
    g++
    # && apk del build-dependencies

RUN npm install -g gulp typescript

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

CMD [ "gulp", "start" ]