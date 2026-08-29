/**
 * PDF Tools — Cloudflare Worker
 *
 * Serve o site estático (binding ASSETS) e os módulos LibreOffice WASM
 * a partir do R2, pois excedem o limite de 25 MiB por asset estático.
 */

const R2_PATHS = new Set([
  '/libreoffice-wasm/soffice.wasm.gz',
  '/libreoffice-wasm/soffice.data.gz',
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (R2_PATHS.has(url.pathname)) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method Not Allowed', { status: 405 });
      }

      const key = url.pathname.slice(1);
      const object = await env.WASM.get(key);
      if (!object) {
        return new Response('Not Found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      // Bytes gzip crus: o loader do app detecta o magic number e
      // descomprime via DecompressionStream — não usar Content-Encoding.
      headers.set('Content-Type', 'application/gzip');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('X-Content-Type-Options', 'nosniff');

      return new Response(request.method === 'HEAD' ? null : object.body, {
        headers,
      });
    }

    return env.ASSETS.fetch(request);
  },
};
