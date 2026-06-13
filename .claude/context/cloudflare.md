# Cloudflare Worker

## Location: `apps/cloudflare/`
## Config: `wrangler.toml`

## Purpose
OG meta tag injection for social media crawlers. The SPA is a client-rendered React app — crawlers (Telegram, WhatsApp, Discord, Twitter, etc.) can't execute JS, so they see an empty page. The Worker intercepts requests from known crawler User-Agents on tree share URLs and returns a pre-rendered HTML page with proper OG/Twitter meta tags.

## How it works
1. Worker sits in front of the SPA (deployed to Cloudflare)
2. Every request comes in:
   - If NOT a tree URL OR NOT a crawler UA → `fetch(request)` (pass-through to SPA)
   - If IS a tree URL AND IS a crawler → fetch preview data from API, return injected HTML
3. Tree URL pattern: `/family-trees/:uuid` or `/family-trees/:uuid/shared`
4. Crawler detection via `BOT_UA` regex (covers Telegram, WhatsApp, Discord, Twitter, Facebook, Google, etc.)

## Environment variables (`wrangler.toml` bindings)
```
API_URL          — URL of the NestJS API
OG_FALLBACK_IMAGE — Default OG image when tree has no image
```

## API call
Fetches `GET {API_URL}/family-trees/{treeId}/preview` (public endpoint, no auth needed).
- Cloudflare edge cache: 300s
- If API is down or returns non-OK → fail open (pass through to SPA)

## Injected HTML includes
- `<title>`, `<meta name="description">`
- Open Graph: `og:type`, `og:site_name`, `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:locale`
- Twitter Card: `summary_large_image`
- `<link rel="canonical">`
- JSON-LD `WebPage` schema

## Error handling
Always fails open — a Worker error never blocks the user from loading the SPA.
