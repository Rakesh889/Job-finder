require('dotenv').config();
const express = require('express');
const path = require('path');

const FREEHIRE_API = 'https://freehire.me/api/v1';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Proxies to freehire's public (keyless) job search API — keeps the browser
// from needing CORS access and gives one place to adjust params later.
app.get('/api/search', async (req, res) => {
  const { q, work_mode, seniority, regions, countries, category, limit, offset } = req.query;

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (work_mode) params.set('work_mode', work_mode);
  if (seniority) params.set('seniority', seniority);
  if (regions) params.set('regions', regions);
  if (countries) params.set('countries', countries);
  if (category) params.set('category', category);
  params.set('limit', limit || '20');
  params.set('offset', offset || '0');
  params.set('sort', 'posted_at');
  params.set('order', 'desc');

  try {
    const upstream = await fetch(`${FREEHIRE_API}/jobs/search?${params.toString()}`);
    const data = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Could not reach freehire API', detail: e.message });
  }
});

const PORT = process.env.PORT || 3600;
app.listen(PORT, () => {
  console.log(`Job finder running at http://localhost:${PORT}`);
});
