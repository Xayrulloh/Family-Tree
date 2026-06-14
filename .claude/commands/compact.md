Compact the current session context and save a summary to the implementation log.

Steps:
1. Summarize what was accomplished in this session:
   - What features/fixes were implemented
   - What files were created or modified (list them)
   - Any key architectural decisions made
   - Any open TODOs or things left for next session
2. Capture the **key/important notes** from this session — the non-obvious knowledge worth keeping even if no context file maps to it. Examples:
   - Bugs fixed and their root cause (e.g. "fixed Swagger showing the same response for all endpoints — caused by build minification mangling DTO class names; fix was `optimization: false` in `apps/api/project.json`")
   - Gotchas, footguns, or surprising behavior discovered
   - Why a decision was made (the reasoning, not just the change)
   - Anything you'd want a future session to know before touching the same area
   Save these notes so they persist:
   - If a relevant context file exists (db.md, api.md, web.md, etc.), add a short note there (e.g. a "Gotchas" or "Notes" line in the relevant section)
   - Otherwise, always record them in the implementation-log.md entry below — every session's important learnings must end up somewhere in `.claude/context/`
3. Format the summary as a new entry:
   ```
   ## YYYY-MM-DD — <short session title>
   - bullet 1
   - bullet 2
   - **Key note:** <root cause / gotcha / decision worth remembering>
   ```
4. Append this entry to `.claude/context/implementation-log.md`
5. Also update any context files that are now outdated:
   - If new DB tables were added → update `db.md`
   - If new API endpoints were added → update `api.md`
   - If new pages/features were added → update `web.md`
   - If shared Zod schemas/types changed → update `shared.md`
   - If Cloudflare Worker behavior changed → update `cloudflare.md`
   - If build/tooling/config behavior changed → note it in `project.md`
6. Confirm what was saved and which context files were updated.

Keep each log entry tight — 5–10 bullets max. Focus on what's non-obvious or wouldn't be derivable from reading the code. The important-notes capture (step 2) is the priority — never drop a hard-won learning just because it doesn't fit an existing context file.
