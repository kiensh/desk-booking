# Build Base stage
FROM node:22-alpine AS node-22-alpine-base

COPY deploy/Ho_Chi_Minh /etc/localtime
COPY deploy/tls-ca-bundle.pem /usr/local/share/ca-certificates/
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/tls-ca-bundle.pem
RUN cat /usr/local/share/ca-certificates/tls-ca-bundle.pem >> /etc/ssl/certs/ca-certificates.crt


# Build stage
FROM node-22-alpine-base AS builder

WORKDIR /app/frontend

COPY app/frontend/package.json app/frontend/yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

COPY app/frontend/ .
RUN yarn build


# Production stage
FROM alpine:3.22

RUN apk add --no-cache nginx
RUN mkdir -p /usr/share/nginx/html /run/nginx

COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY app/frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
