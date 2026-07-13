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
timestamp every run. Generated *sources* under `src/apps/default/**` can also churn without a real change
(`hooks/locks/index.ts` in particular reorders its exports, because the backend doesn't guarantee a stable
order). Both are expected noise; discard them if nothing else changed.

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

The generator is deterministic: running it twice against the same backend rewrites nothing, and it only
re-stamps `blok.json`'s `generatedAt` when the content actually changed.

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

Two things to know:

- **Both containers run as uid 1000, not root** — deliberately. They bind-mount their source dir and
  *write into it* (the frontend regenerates `src/apps/default/**`; the backend writes `agent_data.db`). As
  root those files come out root-owned, and your host `yarn dev` then dies with
  `EACCES: permission denied, unlink .../src/apps/default/hooks/actions/...`. uid 1000 matches a typical
  Linux host user. If your host user isn't uid 1000, adjust the `USER` lines in the two Dockerfiles.
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

**This repo has no git remote yet**, so `just release-dry` currently fails with `ENOREPOURL` —
semantic-release derives the repository URL from `origin`. The release pipeline is configured but has not
been exercised end-to-end. When you add a remote:

```bash
git remote add origin git@github.com:<you>/newswitch.git
git push -u origin main
git push --tags          # REQUIRED: without the v1.0.0 tag, semantic-release has no baseline
                         # and will compute a version from the entire history
```

A full local dry run also needs a `GITHUB_TOKEN` in the environment (the GitHub plugin verifies auth even
in `--dry-run`). In CI, both the URL and the token come from the Actions checkout automatically.

## Known debt

The frontend gates are green and **blocking** in CI (`yarn lint`, `yarn types`, `yarn test`, `yarn build`).

Two things are deliberately left unfinished, both marked `// TODO: not mounted` in
`src/components/navigation/AppNavigationChrome.tsx`: `AppLatestChanges` (the only consumer of
`latestPatches` — the README's "recent patches" surface) and `RouteNavigationBar` are written but never
rendered. They were exported rather than deleted, because they're unfinished wiring, not dead code.

`just lint` still reports **ruff** findings on the backend (mostly missing docstrings). Backend linting
is not yet wired into CI — nothing ever enforced it, so it starts from a backlog.
