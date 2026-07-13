/**
 * Conventional commits are load-bearing here: release.config.cjs derives the version and
 * the changelog from them. `feat:` -> minor, `fix:` -> patch, `feat!:`/BREAKING CHANGE -> major.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Optional, but keeps the changelog readable at a glance.
    "scope-enum": [
      1,
      "always",
      ["backend", "frontend", "codegen", "ci", "docker", "release", "deps", "repo"],
    ],
  },
};
