interface Env {
  API_URL: string;
  OG_FALLBACK_IMAGE: string;
}

interface FamilyTreePreview {
  name: string;
  image: string | null;
}

const BOT_UA =
  /facebookexternalhit|facebookcatalog|Twitterbot|WhatsApp|TelegramBot|Discordbot|Slackbot|LinkedInBot|Googlebot|bingbot|Applebot|Pinterest|redditbot|Embedly|SkypeUriPreview|vkShare|W3C_Validator|XING-contenttabreceiver/i;

const TREE_ROUTE = /^\/family-trees\/([0-9a-f-]{36})(?:\/shared)?\/?$/;

const escapeHtml = (s: string | null | undefined): string =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );

const renderPreviewHtml = (
  preview: FamilyTreePreview,
  pageUrl: string,
  fallbackImage: string,
): string => {
  const title = escapeHtml(preview.name);
  const description = escapeHtml(`${preview.name} — family tree on famtree.uz`);
  const image = escapeHtml(preview.image ?? fallbackImage);
  const url = escapeHtml(pageUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="description" content="${description}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="famtree.uz">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

<link rel="canonical" href="${url}">
</head>
<body></body>
</html>`;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') ?? '';
    const match = url.pathname.match(TREE_ROUTE);

    // Not a tree share URL, or not a crawler → pass through to the SPA untouched
    if (!match || !BOT_UA.test(userAgent)) {
      return fetch(request);
    }

    const treeId = match[1];

    try {
      const apiRes = await fetch(`${env.API_URL}/family-trees/${treeId}/preview`, {
        cf: { cacheTtl: 300, cacheEverything: true },
      });

      if (!apiRes.ok) {
        // Tree missing or API down — let the SPA handle it (it'll show its own error)
        return fetch(request);
      }

      const preview = (await apiRes.json()) as FamilyTreePreview;
      const html = renderPreviewHtml(preview, url.toString(), env.OG_FALLBACK_IMAGE);

      return new Response(html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=300, s-maxage=300',
        },
      });
    } catch {
      // Fail open — never block the SPA on a Worker error
      return fetch(request);
    }
  },
} satisfies ExportedHandler<Env>;
