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

// Não há páginas estáticas por idioma: URLs legadas /{lang}/... são
// redirecionadas para o caminho sem prefixo (o idioma é aplicado em runtime).
const LANG_PREFIX =
  /^\/(en|ar|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|nl|be|da|ko|sv|ru|ja|uk|sk)(\/.*)?$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const langMatch = url.pathname.match(LANG_PREFIX);
    if (langMatch) {
      url.pathname = langMatch[2] || '/';
      return Response.redirect(url.toString(), 301);
    }

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
