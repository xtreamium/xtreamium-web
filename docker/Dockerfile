FROM node:24-alpine AS builder

ARG RUN_MODE=production

WORKDIR /app
COPY package.json package-lock.json* ./
COPY .env.${RUN_MODE} .env

RUN npm install
COPY . .

ENV NODE_ENV=$RUN_MODE
RUN npm run build

FROM nginx:alpine

ARG RUN_MODE=production
ENV NODE_ENV=$RUN_MODE

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
