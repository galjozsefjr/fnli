FROM node:24.13.1-alpine AS base

FROM base AS prepare
RUN apk add --no-cache libc6-compat

WORKDIR /app/api
RUN yarn global add turbo@2.8.14

COPY . .
RUN turbo prune api --docker

FROM base AS builder

WORKDIR /app/api

COPY --from=prepare /app/api/out/json .
RUN yarn install

COPY --from=prepare /app/api/out/full .

ENV NODE_ENV=production

RUN yarn turbo build

FROM base AS runner
WORKDIR /app/api

COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/apps/api/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]


## FROM base AS deps
## RUN apk add --no-cache libc6-compat
## WORKDIR /app/backend

## COPY package.json ./
## COPY yarn.lock* ./
## COPY apps/backend/package.json ./apps/backened/package.json

## RUN --mount=type=cache,target=/usr/local/share/.cache/yarn\
##   yarn install --production=false

## FROM base AS builder
## WORKDIR /app/backend

## COPY --from=deps /app/backend/node_modules ./node_modules
## COPY . .

## ENV NODE_ENV=production
## RUN yarn build

## FROM base AS runner

## WORKDIR /app/backend

## ENV NODE_ENV=production

## COPY --from=builder /app/backend/node_modules ./node_modules
## COPY --from=builder /app/backend/dist ./dist

## EXPOSE 3001

## CMD ["node", "dist/main.js"]
