FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.8.3 /uv /usr/local/bin/uv

ENV UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Dependency layer, cached across source edits
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project

COPY . .
RUN uv sync --frozen

EXPOSE 8099

# No --reload: create_app() takes a required config arg, so there is no
# module-level ASGI app for uvicorn to re-import.
CMD ["python", "test.py"]

# python:slim has no curl, so probe with urllib instead
HEALTHCHECK --interval=5s --timeout=5s --retries=30 --start-period=30s \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://localhost:8099/schemas/states', timeout=3).status == 200 else 1)"
