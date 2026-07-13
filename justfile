set shell := ["bash", "-uc"]

BACKEND_HEALTH := "http://localhost:8099/schemas/states"

# List available recipes
default:
    @just --list

# ---------- setup ----------

# Install python + node dependencies
install:
    cd backend && uv sync --all-extras --dev
    cd frontend && yarn install --frozen-lockfile

# ---------- dev ----------

# Backend only -> http://localhost:8099
dev-backend:
    cd backend && uv run test.py

# Frontend only -> http://localhost:5173 (needs the backend up for fresh codegen)
# Binding + allowedHosts live in vite.config.ts, so no --host flag needed here.
dev-frontend:
    cd frontend && yarn dev

# Block until the backend's schema endpoints answer
wait-backend url=BACKEND_HEALTH:
    #!/usr/bin/env bash
    set -uo pipefail
    echo "waiting for backend at {{url}} ..."
    for _ in $(seq 1 60); do
      if curl -sf "{{url}}" >/dev/null 2>&1; then echo "backend is up"; exit 0; fi
      sleep 1
    done
    echo "backend did not answer within 60s" >&2
    exit 1

# Run backend + frontend together (backend first: the frontend codegen fetches its schemas)
dev:
    #!/usr/bin/env bash
    set -uo pipefail
    trap 'trap - EXIT; kill 0' EXIT INT TERM
    (cd backend && exec uv run test.py) &
    if ! just wait-backend; then
      echo "!! backend unreachable - vite will fall back to the COMMITTED generated hooks" >&2
      echo "!! (see frontend/plugins/generate-app.ts: fetch failures are warnings, not errors)" >&2
    fi
    (cd frontend && exec yarn dev) &
    wait

# ---------- quality ----------

lint:
    cd backend && uv run ruff check .
    cd frontend && yarn lint

# NOTE: not `tsc --noEmit` - the root tsconfig is a solution config with `files: []`,
# so a non-build tsc there checks ZERO files and passes trivially.
types:
    cd frontend && yarn types

# Fast tests (no running server needed)
test:
    cd backend && uv run pytest -k "not integration"

# Everything, including integration tests
test-all:
    cd backend && uv run pytest

check: lint types test

# ---------- build ----------

# Frontend bundle + backend wheel/sdist
build:
    cd frontend && yarn build
    cd backend && uv build --out-dir dist

clean:
    rm -rf backend/.venv backend/dist backend/.pytest_cache backend/.ruff_cache
    rm -rf frontend/node_modules frontend/dist blok.zip
    find . -name __pycache__ -type d -prune -exec rm -rf {} +

# ---------- docker ----------

up:
    docker compose up --build

down:
    docker compose down

# Also drops the named venv / node_modules volumes (needed after a dependency change)
down-hard:
    docker compose down -v

logs:
    docker compose logs -f

# ---------- release ----------

# Dry-run the unified release locally (no push, no tag)
release-dry:
    npx -y \
      -p semantic-release@24 \
      -p @semantic-release/changelog \
      -p @semantic-release/exec \
      -p @semantic-release/git \
      -p @semantic-release/github \
      -p conventional-changelog-conventionalcommits \
      semantic-release --dry-run --no-ci
