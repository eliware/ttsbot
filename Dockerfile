# syntax=docker/dockerfile:1.7
FROM node:26-bookworm-slim

ENV NODE_ENV=production \
    HEALTH_PORT=8080

WORKDIR /opt/ttsbot

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        libopus-dev \
        pkg-config \
        python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force

COPY --chown=node:node commands ./commands
COPY --chown=node:node events ./events
COPY --chown=node:node src ./src
COPY --chown=node:node replacements.json ttsbot.mjs ./

USER node
EXPOSE 8080
CMD ["node", "ttsbot.mjs"]
