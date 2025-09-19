FROM node:lts as builder

ARG RUN_MODE=production

WORKDIR /app
COPY package.json package.json
COPY .env.${RUN_MODE} .env

RUN yarn install
COPY . .

ENV NODE_ENV=$RUN_MODE
RUN yarn build --mode $RUN_MODE

FROM nginx:alpine
ENV NODE_ENV=$RUN_MODE
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "/bin/sh", "-c", "nginx -g 'daemon off;'" ]
