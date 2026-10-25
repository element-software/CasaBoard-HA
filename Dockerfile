FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/app/package.json apps/app/package.json
COPY apps/public/package.json apps/public/package.json
COPY packages/ packages/
RUN npm ci

FROM base AS build
ARG CASABOARD_VERSION=dev
WORKDIR /repo
# Source first, then overlay hoisted workspace installs from the deps stage.
# npm workspaces hoist into /repo/node_modules — apps/*/node_modules is often absent.
COPY . .
COPY --from=deps /repo/node_modules ./node_modules
ENV CASABOARD_VERSION=${CASABOARD_VERSION}
RUN npm run build --workspace=app

FROM base AS runtime
LABEL org.opencontainers.image.source="https://github.com/element-software/CasaBoard-HA"
ARG CASABOARD_VERSION=dev
WORKDIR /app
ENV NODE_ENV=production
ENV DATA_DIR=/data
ENV PORT=3000
ENV CASABOARD_VERSION=${CASABOARD_VERSION}
COPY --from=build /repo/apps/app/.next/standalone ./
COPY --from=build /repo/apps/app/.next/static ./apps/app/.next/static
COPY --from=build /repo/apps/app/public ./apps/app/public
COPY apps/app/ingress-server.cjs ./apps/app/ingress-server.cjs

EXPOSE 3000
VOLUME ["/data"]
CMD ["node", "apps/app/ingress-server.cjs"]
