Compact the current session context and save a summary to the implementation log.

Steps:
1. Summarize what was accomplished in this session:
   - What features/fixes were implemented
   - What files were created or modified (list them)
   - Any key architectural decisions made
   - Any open TODOs or things left for next session
2. Format the summary as a new entry:
   ```
   ## YYYY-MM-DD — <short session title>
   - bullet 1
   - bullet 2
   ```
3. Append this entry to `.claude/context/implementation-log.md`
4. Also update any context files that are now outdated:
   - If new DB tables were added → update `db.md`
   - If new API endpoints were added → update `api.md`
   - If new pages/features were added → update `web.md`
   - If shared Zod schemas/types changed → update `shared.md`
   - If Cloudflare Worker behavior changed → update `cloudflare.md`
5. Confirm what was saved and which context files were updated.

Keep each log entry tight — 5–10 bullets max. Focus on what's non-obvious or wouldn't be derivable from reading the code.
