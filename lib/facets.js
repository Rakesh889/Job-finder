const FREEHIRE_API = 'https://freehire.me/api/v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // facet values barely change minute-to-minute

let cache = null;
let cachedAt = 0;

async function getFacets() {
  if (cache && Date.now() - cachedAt < CACHE_TTL_MS) return cache;

  const res = await fetch(`${FREEHIRE_API}/jobs/facets`);
  if (!res.ok) throw new Error(`freehire facets request failed (${res.status})`);

  const data = await res.json();
  cache = data.data.facets;
  cachedAt = Date.now();
  return cache;
}

/** Returns the top-N matching values (case-insensitive substring match), sorted by job count descending. */
function searchFacet(facetMap, query, limit = 8) {
  const q = query.trim().toLowerCase();
  const entries = Object.entries(facetMap);
  const matches = q
    ? entries.filter(([name]) => name.toLowerCase().includes(q))
    : entries;

  return matches
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

module.exports = { getFacets, searchFacet };
