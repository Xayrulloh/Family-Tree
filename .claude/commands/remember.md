Load full project context for this session. Read all files in `.claude/context/` and summarize the key points so you're ready to work without re-exploring the codebase.

Steps:
1. Read `.claude/context/project.md`
2. Read `.claude/context/db.md`
3. Read `.claude/context/api.md`
4. Read `.claude/context/web.md`
5. Read `.claude/context/cloudflare.md`
6. Read `.claude/context/shared.md`
7. Read `.claude/context/implementation-log.md`

After reading all files, print a compact summary:
- What the project is (1 sentence)
- Current tech stack (bullet list)
- DB tables (names only)
- API endpoints grouped by module (condensed)
- Recent implementation log entries (last 3)

Confirm you're ready to work.
