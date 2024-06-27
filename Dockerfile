FROM node:20.12-alpine3.19 AS base

RUN apk --no-cache add libc6-compat

# Builder stage ==============================================================
FROM base AS deps

# Set working directory in the builder stage
WORKDIR /app

# Copy package.json and yarn.lock for Yarn installation
COPY package.json yarn.lock .

# Install Node.js dependencies in the builder stage
RUN yarn install

FROM base AS dev

# Set working directory in the runner stage
WORKDIR /app

# Set environment variables

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the app
ENTRYPOINT ["yarn", "dev"]

# Runner stage
FROM base AS prod_builder

# Set working directory in the runner stage
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN yarn build

# prod stage ================================================================
FROM base AS prod

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# RUN apk --no-cache add caddy
# COPY --chown=nextjs:nodejs ./deploy/Caddyfile /etc/caddy/Caddyfile
COPY --chown=nextjs:nodejs ./deploy/run_with_envrc.sh .

RUN npm install sharp@0.33.3

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=prod_builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=prod_builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=prod_builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Start the app
ENTRYPOINT ["/bin/sh", "./run_with_envrc.sh"]
