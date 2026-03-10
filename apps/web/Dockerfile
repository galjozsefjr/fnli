FROM node:24.13.1-alpine AS base

WORKDIR /app/web

FROM base AS prepare
RUN yarn global add turbo@2.8.14
COPY . .

RUN turbo prune web --docker

FROM base AS builder
COPY --from=prepare /app/web/out/json .
RUN yarn install
COPY --from=prepare /app/web/out/full .

ENV NODE_ENV=production

RUN yarn turbo build

FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/web/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/web/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/web/apps/web/public ./apps/web/public

CMD ["node", "apps/web/server.js"]