# newswitch

A microscope control stack — "OpenUC2 but new". Two packages, one version, released together.

| | | |
|---|---|---|
| **`backend/`** | Python 3.11+, FastAPI + [rekuest-next](https://github.com/arkitektio/rekuest-next), managed with `uv` | serves on `:8099` |
| **`frontend/`** | React 19 + Vite 7 + Tailwind, managed with `yarn` | serves on `:5173` |

## Quickstart

```bash
just install     # uv sync + yarn install
just dev         # backend, then frontend -> http://localhost:5173
```

Run `just` on its own to see every recipe.

## The one rule: the backend comes up first

The frontend is **generated from the backend**. On every `vite dev` and `vite build`, the plugin at
`frontend/plugins/generate-app.ts` fetches three schema endpoints from a *running* backend —
`/schemas/implementations`, `/schemas/states`, `/schemas/locks` — and regenerates the typed hooks in
`frontend/src/apps/default/**` along with `frontend/blok.json`.

If the backend is **not** reachable, the codegen does **not** fail. It warns and silently falls back to
the committed generated files. That is deliberate — it's what lets CI and the release build work with no
backend running — but it means:

> **If you start the frontend without the backend, you are developing against stale hooks and nothing will
> stop you.** `just dev` sequences the two and warns loudly if the backend never came up.

`frontend/blok.json` and `frontend/src/apps/default/**` are **committed on purpose**. Don't gitignore them.

`blok.json` will show as modified after almost any `dev`/`build` — the plugin rewrites its `generatedAt`
timestamp every run. That's expected noise; discard it if nothing else changed.

## Common recipes

```bash
just install                 # install both halves
just dev                     # both, correctly sequenced
just dev-backend             # backend only  -> :8099
just dev-frontend            # frontend only -> :5173 (backend must already be up)

just check                   # lint + types + tests
just lint                    # ruff + eslint
just types                   # tsc against tsconfig.app.json
just test                    # pytest -k "not integration"
just test-all                # pytest, including integration

just build                   # frontend bundle + backend wheel/sdist
just clean                   # nuke .venv, node_modules, dist
```

## Docker

```bash
just up          # docker compose up --build
just down
just down-hard   # ALSO drops the named volumes - see below
just logs
```

Compose is the one path with **no schema race**: the frontend's `depends_on` waits on a backend
healthcheck that probes the exact endpoint the codegen needs.

Two things to know:

- **After changing dependencies, `docker compose build` is not enough.** The venv and `node_modules` live
  in named volumes (so the source bind-mount doesn't hide them), and those volumes survive a rebuild. Use
  `just down-hard` to drop them, then `just up`.
- **The backend has two different URLs inside Docker**, and they are not interchangeable. The codegen runs
  *inside the frontend container* and reaches the backend at `http://backend:8099` (service name); the
  client JS runs *in your browser on the host* and reaches it at `http://localhost:8099` (published port).
  That split lives in `frontend/.env.docker`, which compose selects via `vite --mode docker`.

## Environment

`frontend/.env` holds committed, non-secret **localhost defaults**. To point at a different machine, create
an untracked `frontend/.env.local` (it overrides `.env`, and is gitignored):

```dotenv
VITE_BACKEND_URL=http://my-lab-box:8099
VITE_WEBSOCKET_URL=ws://my-lab-box:8099/ws
VITE_SCHEMA_IMPLEMENTATION_URL=http://my-lab-box:8099/schemas/implementations
VITE_SCHEMA_STATES_URL=http://my-lab-box:8099/schemas/states
VITE_SCHEMA_LOCKS_URL=http://my-lab-box:8099/schemas/locks
```

The backend itself reads no `.env` — it's configured in code via `ImswitchConfig` (`backend/newswitch/app.py`).

## Releases

One version for the whole repo, one tag (`vX.Y.Z`), **GitHub Releases only** (nothing goes to PyPI or npm).

Pushing [conventional commits](https://www.conventionalcommits.org/) to `main` triggers
`.github/workflows/release.yml`, which runs semantic-release from the root `release.config.cjs`. It bumps
`backend/pyproject.toml` **and** `frontend/package.json` to the same version, rebuilds the frontend *after*
the bump (so `blok.json` carries the new version), and attaches `blok.zip`, `blok.json`, and the backend
wheel + sdist to the release.

Preview what a release would do, without tagging or pushing:

```bash
just release-dry
```
