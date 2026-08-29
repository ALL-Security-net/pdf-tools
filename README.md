# PDF Tools

Suíte de ferramentas PDF da ALLSecurity — 100% no navegador, privacy-first.

Todos os arquivos são processados localmente no navegador (WebAssembly). Nenhum documento é enviado para servidores.

## Ferramentas

Mais de 100 ferramentas, incluindo:

- **Organizar**: mesclar, dividir, extrair, remover e reordenar páginas
- **Converter para PDF**: imagens (JPG, PNG, WebP, HEIC, TIFF...), Word, Excel, PowerPoint, Markdown, HTML, e-books e mais
- **Converter de PDF**: imagens, texto, JSON, CSV, Markdown, PDF/A e mais
- **Editar**: editor de PDF, edição de texto, anotações, carimbos, marca d'água, números de página, cabeçalho/rodapé
- **Segurança**: criptografar, descriptografar, assinar digitalmente, validar assinaturas, sanitizar, remover metadados
- **Otimizar**: comprimir, reparar, linearizar, OCR

## Desenvolvimento

```bash
npm install
npm run dev
```

### Build de produção

```bash
npm run build
npm run preview
```

Saída em `dist/` — site estático, pode ser servido por qualquer servidor de arquivos.

Requisito: os headers `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Embedder-Policy: require-corp` são necessários para os módulos WebAssembly multi-thread (ver `serve.json`).

### Testes e lint

```bash
npm run test:run
npm run lint
```

### Configuração (opcional)

Copie `.env.example` para `.env.production` para configurar URLs de módulos WASM auto-hospedados, idioma padrão e branding. Sem configuração, os módulos WASM avançados são carregados do CDN público (jsDelivr).

## Licença e créditos

Este projeto é um fork rebrandizado do projeto open source [BentoPDF](https://github.com/alam00000/bentopdf), distribuído sob a licença **AGPL-3.0-only** (ver [LICENSE](LICENSE)). Modificações: remoção de páginas de marketing/doação, rebranding para PDF Tools e adaptação da identidade visual ALLSecurity.
