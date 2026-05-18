# @family-tree/cloudflare

Cloudflare Worker that adds social-share link previews (Open Graph / Twitter Cards) to the family-tree SPA.

When a crawler (Telegram, WhatsApp, Discord, LinkedIn, Facebook, Twitter, Google, etc.) fetches a tree share URL, the worker intercepts the request, calls the API's `/family-trees/:id/preview` endpoint, and returns a minimal HTML response with the tree's `name` and `image` as OG/Twitter tags.

Real browsers are passed through to the SPA untouched.

## Routes covered

- `www.famtree.uz/family-trees/:uuid`
- `www.famtree.uz/family-trees/:uuid/shared`

## One-time setup

```bash
# From the repo root, install workspace deps
pnpm install

# Log into Cloudflare (opens browser)
pnpm wrangler login
```

## Local dev

```bash
pnpm nx run cloudflare:dev
# wrangler dev → http://localhost:8787
```

Test it with a bot user-agent:

```bash
curl -s -A "TelegramBot (like TwitterBot)" \
  "http://localhost:8787/family-trees/76a8c772-6014-4cbd-a29c-e21e477a9f23/shared" \
  | grep og:
```

## Deploy

```bash
pnpm nx run cloudflare:deploy
```

## Live logs

```bash
pnpm nx run cloudflare:tail
```

## Validate previews after deploy

| Platform | Validator |
| --- | --- |
| Facebook / WhatsApp | https://developers.facebook.com/tools/debug/ |
| Twitter / X | https://cards-dev.twitter.com/validator |
| LinkedIn | https://www.linkedin.com/post-inspector/ |
| Telegram | paste link in Saved Messages; if stale, message `@WebpageBot` |
| Discord | paste link in any channel |

## Configuration

Edit [wrangler.toml](./wrangler.toml):

- `API_URL` — origin of the NestJS API. The worker calls `${API_URL}/family-trees/:id/preview`.
- `OG_FALLBACK_IMAGE` — image to use when a tree has no custom image set.
- `[[routes]].pattern` — URL pattern the worker intercepts.

## How it works

1. Request arrives at `www.famtree.uz/family-trees/...`
2. Worker checks the URL matches the tree share pattern
3. Worker checks the `User-Agent` header against the bot allowlist
4. **Not a bot** → `fetch(request)` passes through to the SPA
5. **Is a bot** → calls `${API_URL}/family-trees/:id/preview`, renders HTML with OG tags, returns it (cached 5 min at the edge)
6. On any failure (API down, tree missing, unexpected error) → fails open and passes through to the SPA
