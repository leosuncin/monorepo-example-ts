ARG NODE_VERSION=22-slim

FROM node:${NODE_VERSION} AS dependencies

ENV PNPM_HOME="/var/cache/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /monorepo

RUN --mount=type=cache,id=pnpm-store,target=/var/cache/pnpm/store \
    --mount=type=bind,source=package.json,target=/monorepo/package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=/monorepo/pnpm-lock.yaml \
    --mount=type=bind,source=pnpm-workspace.yaml,target=/monorepo/pnpm-workspace.yaml \
    corepack enable && \
    pnpm install --frozen-lockfile --strict-peer-dependencies


FROM dependencies AS pruner

ARG PROJECT

WORKDIR /monorepo

COPY . .

RUN pnpm exec turbo prune --docker ${PROJECT}


FROM dependencies AS builder

ARG PROJECT
ARG TURBO_TEAM
ARG TURBO_TOKEN

ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}

WORKDIR /app

COPY --from=pruner /monorepo/out/*.yaml ./
COPY --from=pruner /monorepo/out/json/ .
COPY --from=pruner /monorepo/tsconfig.base.json .

RUN --mount=type=cache,id=pnpm-store,target=/var/cache/pnpm/store \
    pnpm install --frozen-lockfile --strict-peer-dependencies

COPY --from=pruner /monorepo/out/full/ .

RUN --mount=type=cache,id=pnpm-store,target=/var/cache/pnpm/store \
    pnpm exec turbo run build --filter=${PROJECT} && \
    pnpm --filter ${PROJECT} --prod deploy out/ && \
    find -type f -name '*.ts' -exec rm -f '{}' \;


FROM gcr.io/distroless/nodejs22-debian12:nonroot AS backend

ARG PROJECT
ARG PORT=3030

ENV NODE_ENV=production
ENV PORT=${PORT}

COPY --from=builder --chown=nonroot:nonroot /app/out/dist ${PROJECT}
COPY --from=builder --chown=nonroot:nonroot /app/out/package.json ${PROJECT}/
COPY --from=builder --chown=nonroot:nonroot /app/out/node_modules ${PROJECT}/node_modules

WORKDIR /home/nonroot/${PROJECT}

EXPOSE ${PORT}

HEALTHCHECK CMD ["/nodejs/bin/node", "health-check.js"]

CMD ["index.js"]


FROM devforth/spa-to-http:latest AS frontend

ARG PROJECT

COPY --from=builder /app/apps/${PROJECT}/dist/ .
