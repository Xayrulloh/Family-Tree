Create a GitHub Pull Request for the current branch.

Steps:
1. Run `git status` to check for uncommitted changes — warn if any exist
2. Run `git branch --show-current` to get the current branch name
3. Run `git log main..HEAD --oneline` to see all commits on this branch vs main
4. Run `git diff main...HEAD --stat` to see what files changed
5. Based on the commits and diff, draft:
   - A concise PR title (under 70 chars)
   - A PR body with sections: ## Summary (3–5 bullets of what changed), ## Changes (key files touched), ## Test plan (checklist)
6. Check if the branch is pushed: `git status -sb`
   - If not pushed: run `git push -u origin HEAD`
7. Create the PR: `gh pr create --title "..." --body "..." --base main`
8. Return the PR URL

If `gh` is not authenticated or the repo has no remote, report the issue clearly.
