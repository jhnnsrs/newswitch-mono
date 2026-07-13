/**
 * Unified release for the newswitch monorepo.
 * One version, one tag (vX.Y.Z), both packages bumped and shipped together.
 * GitHub Releases only - nothing is published to PyPI or npm.
 */
module.exports = {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits" }],
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    [
      "@semantic-release/exec",
      {
        // The order is load-bearing: the frontend build reads app.version out of
        // package.json when it writes blok.json, so it must run AFTER the bump.
        // No backend runs in CI, so the vite codegen plugin's schema fetches fail,
        // warn, and fall back to the committed blok.json + src/apps/default/**.
        prepareCmd: [
          "(cd backend && uv version --no-sync '${nextRelease.version}')",
          "(cd frontend && npm version '${nextRelease.version}' --no-git-tag-version --allow-same-version)",
          "(cd frontend && yarn build)",
          "rm -f blok.zip && (cd frontend/dist && zip -qr ../../blok.zip .)",
          "(cd backend && uv build --out-dir dist)",
        ].join(" && "),
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "CHANGELOG.md",
          "backend/pyproject.toml",
          // uv.lock embeds the project's own version
          "backend/uv.lock",
          "frontend/package.json",
          // Required, or the bumped app.version never lands
          "frontend/blok.json",
        ],
        message: "chore(release): v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          { path: "blok.zip", label: "Frontend bundle (blok.zip)" },
          { path: "frontend/blok.json", label: "Frontend manifest (blok.json)" },
          { path: "backend/dist/*.whl", label: "Backend wheel" },
          { path: "backend/dist/*.tar.gz", label: "Backend sdist" },
        ],
      },
    ],
  ],
};
