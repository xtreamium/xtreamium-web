FROM oven/bun:1-alpine AS builder

ARG RUN_MODE=production

WORKDIR /app
COPY package.json bun.lockb ./
COPY .env.${RUN_MODE} .env

RUN bun install --frozen-lockfile
COPY . .

ENV NODE_ENV=$RUN_MODE
RUN bun run build

FROM nginx:alpine

ARG RUN_MODE=production
ENV NODE_ENV=$RUN_MODE

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
