#!/bin/sh

DEFAULT_VAULT_FILE=/vault/secrets/envrc
ENV_FILE=${ENVRC:-$DEFAULT_VAULT_FILE}

# caddy run --config /etc/caddy/Caddyfile &

[ ! -e $ENV_FILE ] || command . $ENV_FILE && node server.js
