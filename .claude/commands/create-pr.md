Create a GitHub Pull Request for the current branch.

Steps:
1. Run `git status` to check for uncommitted changes — warn if any exist
2. Run `git branch --show-current` to get the current branch name
3. Run `git log develop..HEAD --oneline` to see all commits on this branch vs develop
4. Run `git diff develop...HEAD --stat` to see what files changed
5. Based on the commits and diff, draft:
   - A concise PR title (under 70 chars)
   - A PR body with: ## Summary (3–5 bullets), ## Changes (key files), ## Test plan (checklist)
6. If branch not pushed: run `git push -u origin HEAD`
7. Create the PR: `gh pr create --title "..." --body "..." --base develop`
8. Return the PR URL
