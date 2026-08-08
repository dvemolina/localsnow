# GitHub workflow for LocalSnow

This repo should not depend on local-only checks or manual GitHub juggling for normal PRs.

## Required baseline for every PR

The `PR Checks` workflow runs on every pull request and manually via `workflow_dispatch`:

1. Install dependencies with the pinned pnpm from `packageManager`.
2. Run `pnpm test:run`.
3. Run `pnpm run build`.
4. Build the production Docker image without pushing it.

The workflow provides safe CI-only dummy configuration values for server modules that validate environment at import/build time. These values are not production secrets and must not be used outside CI.

## Why `svelte-check` is not required yet

Repo-wide `svelte-check` has OOM/SIGKILLed during agent review runs. Do not make it a required branch-protection check until it is stabilized. For now, use targeted Svelte diagnostics locally for touched files when needed, and keep CI focused on deterministic unit tests plus production build.

## Recommended branch protection after this PR lands

Once `PR Checks / Test and build` and `PR Checks / Docker build` have passed on at least one PR and exist on `main`, enable branch protection for `main`:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Required checks:
  - `PR Checks / Test and build`
  - `PR Checks / Docker build`
- Require branches to be up to date before merging only if the team accepts the extra rebase churn.
- Do not require repo-wide `svelte-check` until it is stable in CI.

## Stacked PR landing after squash merges

GitHub squash merges rewrite commit SHAs. After PR A lands, child PR B still contains A's original commits, while `main` contains A as a new squash commit. A normal rebase may try to replay already-merged parent commits and create conflicts.

Safe landing pattern:

1. Merge the bottom PR into `main`.
2. Rebuild the next branch from `origin/main` with only that slice's own commits:
   ```bash
   git fetch origin main feat/next-slice
   git checkout feat/next-slice
   git reset --hard origin/main
   git cherry-pick <slice-commit-1> <slice-fix-commit-2>
   ```
3. Verify the slice:
   ```bash
   pnpm test:run
   pnpm run build
   ```
4. Force-push safely:
   ```bash
   git push --force-with-lease origin feat/next-slice
   ```
5. Retarget the PR to `main`:
   ```bash
   scripts/github-retarget-pr-base.sh triskel-labs/localsnow <pr-number> main
   ```
6. Confirm the PR diff contains only that slice's files.
7. Wait for GitHub to report the PR `CLEAN`, then squash-merge into `main`.
8. Repeat upward.

Do not delete intermediate stacked branches until every dependent PR has landed.

## GitHub CLI Projects Classic bug

If this fails:

```bash
gh pr edit <pr-number> --base main
```

with a `repository.pullRequest.projectCards` / Projects Classic deprecation error, use the REST helper instead:

```bash
scripts/github-retarget-pr-base.sh triskel-labs/localsnow <pr-number> main
```
