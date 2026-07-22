// Gera public/og-image.png — a miniatura que aparece ao compartilhar o link.
//
//   npm run og-image
//
// A roda é desenhada pelo próprio index.html, com dados reais buscados do
// proxy público em produção (o .env local não é necessário). O resultado é
// composto num quadro 1200x630, a proporção que as redes esperam.
//
// De propósito o quadro não traz o ano: assim a imagem não vence na virada do
// ano litúrgico. Rode de novo só se o desenho da roda mudar.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'og-image.png');
const PAGE_URL = 'file://' + encodeURI(path.join(ROOT, 'public', 'index.html'));
const API_ORIGIN = process.env.API_ORIGIN || 'https://calendario.caminhoanglicano.com.br';

const WIDTH = 1200;
const HEIGHT = 630;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);

function findChrome() {
  const found = CHROME_CANDIDATES.find(p => fs.existsSync(p));
  if (!found) throw new Error('Chrome não encontrado. Use CHROME_PATH=/caminho/do/chrome');
  return found;
}

const frame = svg => `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:wght@400;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: #fdfaf0;
    display: flex; align-items: center;
    overflow: hidden;
  }
  .text { width: 560px; padding-left: 76px; }
  h1 {
    font-family: 'Cinzel Decorative', serif; font-weight: 400;
    font-size: 66px; line-height: 1.05; color: #b8943e; letter-spacing: 1px;
  }
  .rule { width: 132px; height: 1px; background: #c9a94e; opacity: .7; margin: 26px 0; }
  h2 {
    font-family: 'Cinzel', serif; font-weight: 400;
    font-size: 23px; letter-spacing: 3px; color: #8a6e2f; text-transform: uppercase;
    line-height: 1.5;
  }
  .site {
    margin-top: 34px;
    font-family: 'Cormorant Garamond', serif; font-size: 20px;
    letter-spacing: 1.5px; color: #a89878;
  }
  /* Inteira no quadro: cortada, o anel das estações fica sem começo nem fim
     e a imagem parece um enquadramento errado, não uma sangria intencional. */
  .wheel { position: absolute; right: 28px; top: 50%; transform: translateY(-50%); }
  .wheel svg { width: 574px; height: 574px; display: block; }
</style>
<div class="text">
  <h1>O Ano Litúrgico</h1>
  <div class="rule"></div>
  <h2>Calendário do<br>Ano Cristão</h2>
  <p class="site">caminhoanglicano.com.br</p>
</div>
<div class="wheel">${svg}</div>
`;

async function main() {
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
  const page = await browser.newPage();

  // Busca os dados reais no proxy público, para a roda não sair cheia de
  // "DOMINGO" como acontece com dados simulados. A resposta é obtida aqui no
  // Node e devolvida à página: buscar direto do file:// esbarraria em CORS.
  await page.setRequestInterception(true);
  page.on('request', async req => {
    const api = req.url().match(/\/api\/(\d+)\/(\w+)\?(.*)$/);
    if (!api) return req.continue();
    const [, year, endpoint, query] = api;
    try {
      const upstream = await fetch(`${API_ORIGIN}/api/${year}/${endpoint}?${query}`);
      req.respond({
        status: upstream.status,
        contentType: 'application/json',
        body: await upstream.text()
      });
    } catch (err) {
      req.abort();
    }
  });

  await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window._wheelReady === true', { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);

  const svg = await page.evaluate(() => document.querySelector('svg.wheel').outerHTML);

  const shot = await browser.newPage();
  await shot.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await shot.setContent(frame(svg), { waitUntil: 'networkidle0' });
  await shot.evaluate(() => document.fonts.ready);
  await shot.screenshot({ path: OUT, type: 'png' });

  await browser.close();

  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`✓ ${path.relative(ROOT, OUT)} — ${WIDTH}x${HEIGHT}, ${kb} KB`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
