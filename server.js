require('dotenv').config();
const express = require('express');
const path = require('path');
const { normalizeCountries, countryDisplayName } = require('./lib/countries');
const { getFacets, searchFacet } = require('./lib/facets');
const adzuna = require('./lib/adzuna');

const FREEHIRE_API = 'https://freehire.me/api/v1';

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Autocomplete sources for the city/country inputs, backed by freehire's own
// facet data so suggestions are always real, matchable values.
app.get('/api/facets/cities', async (req, res) => {
  try {
    const facets = await getFacets();
    res.json(searchFacet(facets.cities, req.query.q || ''));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/facets/countries', async (req, res) => {
  try {
    const facets = await getFacets();
    const named = {};
    for (const [code, count] of Object.entries(facets.countries)) {
      const name = countryDisplayName(code);
      named[name] = (named[name] || 0) + count;
    }
    res.json(searchFacet(named, req.query.q || ''));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Proxies to freehire's public (keyless) job search API — keeps the browser
// from needing CORS access and gives one place to adjust params later.
app.get('/api/search', async (req, res) => {
  const { q, work_mode, seniority, regions, countries, cities, category, limit, offset } = req.query;

  // "all"/"any" are natural things to type to mean "no filter" — treat them that way
  // instead of searching for a literal place named "All".
  const isWildcard = v => !v || /^(all|any)$/i.test(v.trim());

  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (work_mode) params.set('work_mode', work_mode);
  if (seniority) params.set('seniority', seniority);
  // freehire's geography filters (regions/countries/cities) OR together instead of
  // ANDing — combining country + city would widen the search, not narrow it. So
  // send only the most specific one provided: city > country > region.
  if (!isWildcard(cities)) {
    params.set('cities', cities);
  } else if (!isWildcard(countries)) {
    params.set('countries', normalizeCountries(countries));
  } else if (!isWildcard(regions)) {
    params.set('regions', regions);
  }
  if (category) params.set('category', category);
  params.set('limit', limit || '20');
  params.set('offset', offset || '0');
  params.set('sort', 'posted_at');
  params.set('order', 'desc');

  let freehireData;
  try {
    const upstream = await fetch(`${FREEHIRE_API}/jobs/search?${params.toString()}`);
    freehireData = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(freehireData);
  } catch (e) {
    return res.status(502).json({ error: 'Could not reach freehire API', detail: e.message });
  }

  // Adzuna is a second, independently-paginated source — only blend it into
  // the first page so "load more" doesn't have to reconcile two separate
  // page cursors. Only fires once ADZUNA_APP_ID/ADZUNA_APP_KEY are set and
  // the resolved country is one Adzuna actually covers.
  const isFirstPage = !offset || offset === '0';
  const adzunaCountry = countries ? normalizeCountries(countries).split(',')[0].trim().toLowerCase() : null;

  if (isFirstPage && adzuna.isConfigured() && adzuna.supportsCountry(adzunaCountry)) {
    try {
      const { jobs, total } = await adzuna.searchAdzuna({
        what: q,
        where: cities || countries,
        country: adzunaCountry,
        resultsPerPage: Math.min(parseInt(limit || '20', 10), 20)
      });
      freehireData.data = [...(freehireData.data || []), ...jobs];
      freehireData.meta = { ...freehireData.meta, total: (freehireData.meta?.total || 0) + total };
    } catch (e) {
      console.warn('[adzuna] search failed, continuing with freehire results only:', e.message);
    }
  }

  res.json(freehireData);
});

const PORT = process.env.PORT || 3600;
app.listen(PORT, () => {
  console.log(`Job finder running at http://localhost:${PORT}`);
});
