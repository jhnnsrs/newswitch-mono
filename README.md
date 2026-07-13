# newswitch

ABSOLUTELY ALPHA

"Imswitch but new". This repo bears almost no resemblance to the original codebase, but aims to provide a
more web-stack-friendly, modern, and maintainable foundation for the same functionality.


## Quickstart

You need Python 3.11+ with uv and Node 20+. The repo uses [just](https://just.systems/man/en/) for task automation. Install it, then:

```bash
just install     # uv sync + yarn install
just dev         # backend , then frontend (will autocodegen)-> http://localhost:5173
```

Run `just` on its own to see every recipe.

## The one rule: the backend comes up first

The frontend is **generated from the backend**. On every `vite dev` and `vite build`, the plugin at
`frontend/plugins/generate-app.ts` fetches three schema endpoints from a *running* backend —
`/schemas/implementations`, `/schemas/states`, `/schemas/locks` — and regenerates the typed hooks in
`frontend/src/apps/default/**` along with `frontend/blok.json`.

If the backend is **not** reachable, the codegen does **not** fail. It warns and silently falls back to
the committed generated files. 

> **If you start the frontend without the backend, you are developing against stale hooks and nothing will
> stop you.** `just dev` sequences the two and warns loudly if the backend never came up.

`frontend/blok.json` and `frontend/src/apps/default/**` are **committed on purpose**. Don't gitignore them.


## Common recipes

```bash
just install                 # install both halves + activate git hooks
just dev                     # both, correctly sequenced
just dev-backend             # backend only  -> :8099 (hot-reloads on edit)
just dev-frontend            # frontend only -> :5173 (backend must already be up)

just check                   # fmt-check + lint + types + tests
just fmt                     # ruff format + prettier, in place
just lint                    # ruff + eslint
just types                   # tsc against tsconfig.app.json
just test                    # pytest + vitest
just test-all                # also runs the backend integration tests
just drift-check             # is the committed codegen still in sync with the backend?

just build                   # frontend bundle + backend wheel/sdist
just clean                   # nuke .venv, node_modules, dist
```

### Codegen drift

Because the generator falls back silently, committed hooks can quietly diverge from the backend.
`just drift-check` (and the `codegen-drift` CI job) boots the backend, regenerates, and fails if the
result differs from what's committed. If it fails, run `just dev-backend`, then `cd frontend && yarn build`,
and commit the regenerated output.

### Commits

Commit messages must be [conventional](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`,
etc. This is enforced by a commit-msg hook (installed by `just install`) because the release version and
changelog are derived from them: a malformed message means no release, or the wrong bump.

## Docker

```bash
just up          # docker compose up --build
just down
just down-hard   # ALSO drops the named volumes - see below
just logs
```

Compose is the one path with **no schema race**: the frontend's `depends_on` waits on a backend
healthcheck that probes the exact endpoint the codegen needs.


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

One version for the whole repo, one tag (`vX.Y.Z`), **GitHub Releases only**.

Pushing [conventional commits](https://www.conventionalcommits.org/) to `main` triggers
`.github/workflows/release.yml`, which runs semantic-release from the root `release.config.cjs`. It bumps
`backend/pyproject.toml` **and** `frontend/package.json` to the same version, rebuilds the frontend *after*

Preview what a release would do, without tagging or pushing:

```bash
just release-dry
```


A full local dry run also needs a `GITHUB_TOKEN` in the environment (the GitHub plugin verifies auth even
in `--dry-run`). In CI, both the URL and the token come from the Actions checkout automatically.


