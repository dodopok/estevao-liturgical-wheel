export default async function handler(req, res) {
  const { year, endpoint, pb } = req.query;
  const pref = JSON.stringify({ prayer_book_code: pb });
  const url = `${process.env.LITURGICAL_API_BASE}/calendar/${year}/${endpoint}?preferences=${encodeURIComponent(pref)}`;
  try {
    const response = await fetch(url, { headers: { 'X-API-Key': process.env.LITURGICAL_API_KEY } });
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    res.json(await response.json());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
