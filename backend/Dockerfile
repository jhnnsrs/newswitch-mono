FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.8.3 /uv /usr/local/bin/uv

ENV UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Run as uid 1000, not root. The app writes agent_data.db (and cache files) into its CWD,
# which compose bind-mounts from the host - as root those land root-owned and the host user
# can no longer delete them. uid 1000 matches a typical Linux host user.
RUN useradd --uid 1000 --create-home app

WORKDIR /app
RUN chown app:app /app
USER app

# Dependency layer, cached across source edits
COPY --chown=app:app pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY --chown=app:app . .
RUN uv sync --frozen

EXPOSE 8099

# No --reload: create_app() takes a required config arg, so there is no
# module-level ASGI app for uvicorn to re-import.
CMD ["python", "test.py"]

# python:slim has no curl, so probe with urllib instead
HEALTHCHECK --interval=5s --timeout=5s --retries=30 --start-period=30s \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8099/schemas/states', timeout=3).status == 200 else 1)"
