FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY apps/api/package.json apps/api/
COPY apps/bot/package.json apps/bot/
COPY apps/web/package.json apps/web/
COPY apps/worker/package.json apps/worker/
COPY packages/blockchain/package.json packages/blockchain/
COPY packages/config/package.json packages/config/
COPY packages/database/package.json packages/database/
COPY packages/logging/package.json packages/logging/
COPY packages/security/package.json packages/security/
COPY packages/trading/package.json packages/trading/
COPY packages/types/package.json packages/types/
COPY packages/ui/package.json packages/ui/
COPY packages/wallet/package.json packages/wallet/
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
COPY . .
RUN pnpm db:generate && pnpm build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000 3001
CMD ["node", "apps/api/dist/index.js"]
