# Build Base stage
FROM node:22-alpine AS node-22-alpine-base

COPY deploy/Ho_Chi_Minh /etc/localtime
COPY deploy/tls-ca-bundle.pem /usr/local/share/ca-certificates/
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/tls-ca-bundle.pem
RUN cat /usr/local/share/ca-certificates/tls-ca-bundle.pem >> /etc/ssl/certs/ca-certificates.crt


# Build stage
FROM node-22-alpine-base AS builder

WORKDIR /app/backend

COPY app/backend/package.json app/backend/yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY app/backend/ .
RUN yarn build


# Production stage
FROM node-22-alpine-base

WORKDIR /app

COPY app/backend/package.json app/backend/yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/backend/dist ./dist

EXPOSE 8080

CMD ["node", "dist/bundle.server.js"]
