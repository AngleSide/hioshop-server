FROM node:18-alpine

WORKDIR /srv/hioshop

RUN apk add --no-cache \
    graphicsmagick

ENV NODE_ENV=production \
    PORT=8360 \
    HOST=0.0.0.0

COPY package.json package-lock.json ./
COPY node_modules ./node_modules
COPY app ./app
COPY view ./view
COPY www ./www
COPY runtime ./runtime
COPY production.js ./production.js
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8360

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
