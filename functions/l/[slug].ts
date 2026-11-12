import links from '../../shortlinks.json';

const destinations = links as Record<string, string>;

export const onRequest: PagesFunction<Record<string, never>, 'slug'> = ({
  request,
  params,
}) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const destination = slug ? destinations[slug] : undefined;
  if (!destination)
    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  const headers = {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Sec-Fetch-Site',
  };

  // Chromium classifies a download as insecure when the navigation that started
  // it has an http:// URL in its chain, even when HSTS or HTTPS-Upgrades fetched
  // every byte over TLS. Typed and bookmarked navigations are exactly the ones
  // that can start from a scheme-less (http://) URL, and browsers mark them with
  // `Sec-Fetch-Site: none`. They get an HTML page so the download starts from a
  // fresh navigation to the https destination instead of the http chain.
  if (request.headers.get('sec-fetch-site') !== 'none') {
    return new Response(null, {
      status: 302,
      headers: { ...headers, Location: destination },
    });
  }

  const href = destination
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  const scriptUrl = JSON.stringify(destination).replaceAll('<', '\\u003C');

  return new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Redirecting…</title>
<meta http-equiv="refresh" content="0;url=${href}">
<script>location.replace(${scriptUrl})</script>
</head>
<body>
<p><a href="${href}">Continue</a></p>
</body>
</html>
`,
    {
      headers: {
        ...headers,
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Referrer-Policy': 'no-referrer',
      },
    }
  );
};
