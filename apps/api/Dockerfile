FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0

WORKDIR /app

RUN addgroup --system api && \
  adduser --system -G api api

COPY dist/apps/api/package*.json ./
COPY dist/apps/api/ ./

RUN chown -R api:api .

USER api

RUN corepack enable && pnpm install --prod

CMD [ "node", "main.js" ]