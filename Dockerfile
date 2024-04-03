FROM node:20.10-alpine3.17 as node_base

RUN apk --no-cache add libc6-compat

# Shared stage with python ==================================================
FROM node_base as node_with_python
# Install Python 3.10 in the runner stage
RUN apk --no-cache add python3

# Builder stage ==============================================================
FROM node_with_python as deps

# Set working directory in the builder stage
WORKDIR /app

# Install Python dependencies and build Python packages in the builder stage
RUN apk --no-cache add \
    python3-dev \
    musl-dev \
    gcc \
    git \
    g++ && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools

# Copy package.json and yarn.lock for Yarn installation
COPY package.json yarn.lock .

# Install Node.js dependencies in the builder stage
RUN yarn install

# Copy source for python dependencies
COPY .git ./.git
COPY roles_royce ./roles_royce

RUN pip3 install ./roles_royce && \
    # pip3 install -r requirements.txt && \
    apk del python3-dev musl-dev gcc g++

# Runner stage for dev ======================================================
FROM node_with_python as dev

# Set working directory in the runner stage
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHON_PATH=/usr/bin/python3

COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /usr/lib/python3.10/site-packages/ /usr/lib/python3.10/site-packages/

RUN ls -la .

# Expose port
EXPOSE 3000

# Start the app
CMD ["yarn", "dev"]

# Runner stage
FROM node_with_python as prod_builder

# Set working directory in the runner stage
WORKDIR /app

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHON_PATH=/usr/bin/python3
ENV NEXT_TELEMETRY_DISABLED 1

COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /usr/lib/python3.10/site-packages/ /usr/lib/python3.10/site-packages/

RUN yarn build


# prod stage ================================================================
FROM node_with_python as prod

WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs


# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next


# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=prod_builder /app/roles_royce ./roles_royce
COPY --from=prod_builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=prod_builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /usr/lib/python3.10/site-packages/ /usr/lib/python3.10/site-packages/
COPY --from=prod_builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

RUN echo '/bin/sh -c "[ ! -e $ENVRC ] || command . $ENVRC && node server.js"' > run.sh

# Start the app
CMD ["/bin/sh", "run.sh"]
