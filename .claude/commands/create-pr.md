Create a GitHub Pull Request for the current branch.

Steps:
1. Run `git status` to check for uncommitted changes — warn if any exist
2. Run `git branch --show-current` to get the current branch name
3. Run `git fetch origin develop` (or ensure local `develop` is up to date)
4. Run `git log origin/develop..HEAD --oneline` to see all commits on this branch vs the remote base
5. Run `git diff origin/develop...HEAD --stat` to see what files changed
6. Based on the commits and diff, draft:
   - A concise PR title (under 70 chars)
   - A PR body with: ## Summary (3–5 bullets), ## Changes (key files), ## Test plan (checklist)
7. Determine labels from the changed files and commit types:
   - `Frontend` — any changes under `apps/web/` or `packages/shared/`
   - `Backend` — any changes under `apps/api/` or `packages/shared/`
   - `enhancement` — new features (feat commits or new files)
   - `bug` — bug fixes (fix commits)
   - `documentation` — docs-only changes
   - `pnpm` — changes to `package.json` or `pnpm-lock.yaml`
   - `Claude` — always add this label (PR is created by Claude)
   - Multiple labels can apply at once
8. If branch not pushed: run `git push -u origin HEAD`
9. Create the PR with all metadata in one command:
   `gh pr create --title "..." --body "..." --base develop --assignee "@me" --label "Claude" --label "<other-label>" ...`
10. Return the PR URL
