// Gera os PDFs de cada formato com dados simulados, pra conferir o layout de
// impressão. Bugs de impressão (papel errado, conteúdo estourando a folha) não
// aparecem na tela — só no PDF —, então vale rodar isto ao mexer no @media print.
//
//   npm run test:print          → PDFs em ./tmp/print-test/
//   CHROME_PATH=... npm run test:print
//
// Cada formato é gerado duas vezes:
//   css-*   respeitando o @page (o resultado ideal)
//   onA4-*  forçando papel A4, simulando um diálogo de impressão preso em A4
// Os dois devem sair sempre com 1 página.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'tmp', 'print-test');
const PAGE_URL = 'file://' + encodeURI(path.join(ROOT, 'public', 'index.html'));

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].filter(Boolean);

function findChrome() {
  const found = CHROME_CANDIDATES.find(p => fs.existsSync(p));
  if (!found) {
    throw new Error(
      'Chrome não encontrado. Informe o caminho com CHROME_PATH=/caminho/do/chrome'
    );
  }
  return found;
}

// Um ano litúrgico simplificado: só as estações, sem celebrações nomeadas.
// Basta pra validar o layout — a roda desenha "DOMINGO" nas fatias.
const MOCK_SEASONS = [
  { slug: 'season-advent', name: 'Advento', start_date: '2025-11-30', end_date: '2025-12-24' },
  { slug: 'season-christmas', name: 'Natal', start_date: '2025-12-25', end_date: '2026-01-05' },
  { slug: 'season-epiphany', name: 'Epifania', start_date: '2026-01-06', end_date: '2026-02-17' },
  { slug: 'season-lent', name: 'Quaresma', start_date: '2026-02-18', end_date: '2026-03-28' },
  { slug: 'season-holy-week', name: 'Semana Santa', start_date: '2026-03-29', end_date: '2026-04-04' },
  { slug: 'season-easter', name: 'Páscoa', start_date: '2026-04-05', end_date: '2026-05-24' },
  { slug: 'season-ordinary-time', name: 'Tempo Comum', start_date: '2026-05-25', end_date: '2026-11-28' }
];

function inspect(file) {
  const pdf = fs.readFileSync(file);
  const pages = pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)?.length || 0;
  const box = pdf.toString('latin1').match(/\/MediaBox\s*\[([^\]]*)\]/)[1].trim().split(/\s+/);
  const mm = pt => Math.round((parseFloat(pt) / 72) * 25.4);
  return { pages, paper: `${mm(box[2])}x${mm(box[3])}mm` };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: findChrome(), headless: true });
  const page = await browser.newPage();

  await page.evaluateOnNewDocument(seasons => {
    window.fetch = async url => {
      const [, year, endpoint] = String(url).match(/api\/(\d+)\/(\w+)/);
      let body = [];
      if (endpoint === 'overview') {
        body = year === '2026'
          ? { seasons, key_dates: { first_sunday_of_advent: { date: '2026-11-29' } } }
          : { seasons: [] };
      } else if (endpoint === 'key_dates') {
        body = { first_sunday_of_advent: { date: '2025-11-30' } };
      }
      return { ok: true, status: 200, json: async () => body };
    };
  }, MOCK_SEASONS);

  await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
  await page.waitForFunction('window._wheelReady === true', { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);

  let failures = 0;
  for (const fmt of Object.keys(await page.evaluate(() => PAPER_SIZES))) {
    await page.evaluate(f => applyPaper(f), fmt);

    for (const [prefix, opts] of [
      ['css', { preferCSSPageSize: true }],
      ['onA4', { format: 'A4' }]
    ]) {
      const file = path.join(OUT, `${prefix}-${fmt}.pdf`);
      await page.pdf({ path: file, printBackground: true, ...opts });
      const { pages, paper } = inspect(file);
      const ok = pages === 1;
      if (!ok) failures++;
      console.log(`${ok ? '✓' : '✗'} ${prefix}-${fmt}: ${pages} página(s), ${paper}`);
    }
  }

  await browser.close();
  console.log(`\nPDFs em ${path.relative(process.cwd(), OUT)}/`);
  if (failures) {
    console.error(`${failures} saída(s) com mais de uma página.`);
    process.exit(1);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
