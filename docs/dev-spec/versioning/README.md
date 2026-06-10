# Versioning — Developer Guide

Tenserium uses **[release-it](https://github.com/release-it/release-it)** with the
**[@release-it/conventional-changelog](https://github.com/release-it/conventional-changelog)**
plugin to automate version bumps, changelog generation, and git tagging.

Releases are **manual** — a developer runs the command locally, reviews what will happen,
and confirms. Nothing is published to npm (the package is private). No GitHub Releases —
a git tag + `CHANGELOG.md` is sufficient for a web app.

---

## Prerequisites

1. **Git working tree must be clean** — commit or stash everything before releasing.
2. **Branch must track `origin/main`** — push and ensure upstream is set.

---

## Running a Release

### Preview first (always recommended)

```bash
pnpm release:dry
```

Simulates the full release: shows the proposed version bump, the changelog diff, and the
git/GitHub operations — without changing anything.

### Perform the release

```bash
pnpm release
```

release-it will ask interactively:

1. **Which version?** — suggests the correct bump from your commit history
   (`feat:` → `minor`, `fix:` → `patch`, `BREAKING CHANGE` → `major`).
2. **Changelog preview** — shows what will be prepended to `CHANGELOG.md`.
3. **Confirm** — one final `y/n` before anything is written.

What happens after you confirm:

- `package.json` version is updated
- `CHANGELOG.md` is prepended with the new section
- Commit `chore: release vX.Y.Z` is created
- Git tag `vX.Y.Z` is created and pushed to `origin`

---

## Conventional Commit Format

release-it determines the version bump from your commit messages:

```
<type>(<optional scope>): <short description>
```

| Type | Changelog section | Version bump |
|---|---|---|
| `feat` | Features | `MINOR` |
| `fix` | Bug Fixes | `PATCH` |
| `perf` | Performance Improvements | `PATCH` |
| `refactor` | — (excluded from changelog) | — |
| `chore` | — (excluded from changelog) | — |
| `docs` | — | — |
| `test` | — | — |
| `BREAKING CHANGE` footer or `feat!` | Breaking Changes | `MAJOR` |

Examples:

```
feat(game): add streak freeze power-up
fix(timer): prevent double-tick on slow devices
feat!: replace localStorage schema
```

The `!` after the type is shorthand for a breaking change.

---

## Version Milestones

| Version | Milestone |
|---|---|
| `0.0.1` | Bootstrap: CI/CD, Angular 22, FSD, Game Engine, Learn, Daily Challenge |
| `0.1.0` | Phase 8: Netlify + Supabase + Auth |
| `0.2.0` | Phase 9: Rank Mode |
| `0.3.0` | Phase 10–11: Leaderboards + Admin Panel |
| `1.0.0` | Phase 12–13: Monetization + Public Launch |

---

## Troubleshooting

**"Git working directory must be clean"**
Commit or stash your changes before running `pnpm release`.

**"No upstream configured"**
Run `git push -u origin main` first.

**GitHub Release fails (401/403)**
Check that `GITHUB_TOKEN` is set and has `repo` scope. Classic Personal Access Tokens work
best; fine-grained tokens need `Contents: write` and `Releases: write` on the repository.

**release-it suggests `patch` when you expected `minor`**
Your commits since the last tag may not use conventional format. Inspect with:
```bash
git log v<last-tag>..HEAD --oneline
```
Any commit without a recognized type prefix defaults to `patch`.
