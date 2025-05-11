FROM crpi-8r9va3057aiau44a.cn-chengdu.personal.cr.aliyuncs.com/mrli-1/node:18-alpine as stage-1

WORKDIR /usr/src/app

# 构建项目
COPY . .
RUN npm install -g pnpm --registry=https://registry.npmmirror.com
RUN pnpm  install --registry https://registry.npmmirror.com --force
RUN pnpm run build

RUN rm -rf src
RUN rm -rf test
RUN rm -rf .git
RUN rm -rf .gitignore
RUN rm -rf pnpm-lock.yaml
RUN rm -rf tsconfig.json
RUN rm -rf .vscode


EXPOSE  3000

ENV NODE_ENV=production


CMD ['node', 'dist/main.js']