import http from 'node:http';
import { readFile } from 'node:fs/promises';

const files = ['theme.js','assets/icono-asesoria-modo-oscuro.svg','assets/familia-en-casa.jpg','assets/icono-asesoria.png','assets/familia-en-casa-768.jpg','assets/doctored-logo.png','assets/premedic-horizontal.png','index.html','politica-de-privacidad/index.html','style.css','quote.css','quote.js','app.js','analytics.js','analytics.css','data.js','assets/senda-calle-1536.jpg','assets/senda-calle-768.jpg','assets/icon.svg','assets/omint-horizontal.png','assets/sancor-horizontal.webp','assets/avalian-logo.png','assets/marca-omint.png','assets/simbolo-omint.jpg','assets/marca-sancor.jpg','assets/simbolo-sancor.png','assets/catalogo-avalian.jpg','assets/catalogo-doctored.jpg'];
const types = { html:'text/html', css:'text/css', js:'text/javascript', jpg:'image/jpeg', png:'image/png', webp:'image/webp', svg:'image/svg+xml' };
const port = Number(process.env.PORT || 4173);
http.createServer(async (req,res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname === '/politica-de-privacidad') {
    res.writeHead(301, { Location: './politica-de-privacidad/' }).end();
    return;
  }
  const path = pathname.slice(1) + (pathname.endsWith('/') ? 'index.html' : '');
  if (!files.includes(path)) { res.writeHead(404).end(); return; }
  try {
    const content = await readFile(new URL(path, import.meta.url));
    res.writeHead(200, { 'Content-Type': types[path.split('.').pop()] }).end(content);
  } catch { res.writeHead(404).end(); }
}).listen(port, '127.0.0.1', () => console.log('http://localhost:' + port));





