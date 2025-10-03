FROM node:18-alpine

WORKDIR /srv/hioshop

RUN apk add --no-cache \
    caddy \
    graphicsmagick \
    supervisor

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
COPY Caddyfile /etc/caddy/Caddyfile
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
