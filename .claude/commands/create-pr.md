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
7. If branch not pushed: run `git push -u origin HEAD`
8. Create the PR: `gh pr create --title "..." --body "..." --base develop`
9. Return the PR URL
