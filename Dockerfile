FROM node:10.16.0-alpine

RUN wget http://download.redis.io/redis-stable.tar.gz && \
    tar xvzf redis-stable.tar.gz && \
    cd redis-stable && \
    make && \
    mv src/redis-server /usr/bin/ && \
    cd .. && \
    rm -r redis-stable

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

RUN npm install -g concurrently gulp typescript

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8080

EXPOSE 6379

# CMD [ "gulp", "start" ]

CMD concurrently "/usr/bin/redis-server --bind '0.0.0.0'" "sleep 5s; gulp start"