#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Pin the official builder image; the container owns its dependencies, so host
# node_modules and Electron runtimes are never replaced with Linux versions.
builder_image="electronuserland/builder@sha256:22c93521ff6ea682e7ef153bb4846d90b769aa3b3f3f3be9ec9090aabc3e877c"
mkdir -p "$project_root/release"

docker run --rm --platform linux/amd64 \
  --mount "type=bind,source=$project_root,target=/source,readonly" \
  --mount "type=bind,source=$project_root/release,target=/output" \
  "$builder_image" bash -euc '
    mkdir -p /tmp/atomic-linux-build
    cd /tmp/atomic-linux-build
    cp /source/package.json /source/package-lock.json /source/LICENSE .
    cp -R /source/electron /source/src /source/assets /source/bluetooth /source/scripts .
    apt-get update -qq
    apt-get install -y --no-install-recommends python3 python3-venv libpython3.10
    python3 -m venv .venv-bluetooth
    .venv-bluetooth/bin/python3 -m pip install --no-cache-dir -r bluetooth/requirements.txt
    npm ci --no-audit --no-fund
    npm run build:bluetooth
    npm run dist:linux -- --publish never --config.directories.output=/output
  '
