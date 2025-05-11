# stage-1 build
FROM crpi-8r9va3057aiau44a.cn-chengdu.personal.cr.aliyuncs.com/mrli-1/node:18-alpine as stage-1

WORKDIR /home

RUN npm install -g pnpm --registry=https://registry.npmmirror.com

RUN pnpm install --registry=https://registry.npmmirror.com

RUN pnpm run build


# stage 2

FROM crpi-8r9va3057aiau44a.cn-chengdu.personal.cr.aliyuncs.com/mrli-1/nginx:1.27.2-alpine as stage-2

WORKDIR /home

COPY --from=stage-1 /home/dist/ /usr/share/nginx/html/
COPY --from=stage-1 /home/nginx.conf /etc/nginx/conf.d/default.conf



