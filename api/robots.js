export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(`User-agent: *
Allow: /
Allow: /privacy
Allow: /terms

Sitemap: https://www.spendlore.gr/sitemap.xml
`);
}

