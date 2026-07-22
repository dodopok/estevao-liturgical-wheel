// Proxy pra Estêvão API — injeta a API key no servidor, sem expô-la ao browser.
// `year` e `endpoint` vêm da URL pública, então precisam ser validados antes de
// entrar na URL upstream: sem isso, qualquer um pode usar a nossa chave pra
// chamar qualquer rota da Estêvão API.
const ENDPOINTS = new Set(['overview', 'key_dates', 'celebrations']);
const PRAYER_BOOK_RE = /^[a-z0-9_]{1,32}$/;

export default async function handler(req, res) {
  const { year, endpoint, pb } = req.query;

  if (!ENDPOINTS.has(endpoint)) {
    return res.status(400).json({ error: 'Endpoint inválido' });
  }
  if (!/^\d{4}$/.test(year) || +year < 1900 || +year > 2200) {
    return res.status(400).json({ error: 'Ano inválido' });
  }
  if (!PRAYER_BOOK_RE.test(pb || '')) {
    return res.status(400).json({ error: 'Livro de oração inválido' });
  }

  const pref = JSON.stringify({ prayer_book_code: pb });
  const url = `${process.env.LITURGICAL_API_BASE}/calendar/${year}/${endpoint}?preferences=${encodeURIComponent(pref)}`;

  try {
    const response = await fetch(url, { headers: { 'X-API-Key': process.env.LITURGICAL_API_KEY } });
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });

    // O calendário de um (ano, livro de oração) é imutável, então o CDN serve
    // tudo do edge e a Estêvão API só é chamada uma vez por combinação.
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
