// Adzuna only covers a fixed set of countries (per their API docs).
const SUPPORTED_COUNTRIES = new Set([
  'gb', 'us', 'at', 'au', 'br', 'ca', 'de', 'fr', 'in', 'it', 'mx', 'nl', 'nz', 'pl', 'ru', 'sg', 'za'
]);

function isConfigured() {
  return !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}

function supportsCountry(code) {
  return SUPPORTED_COUNTRIES.has((code || '').toLowerCase());
}

function stripHtml(str) {
  return (str || '').replace(/<[^>]+>/g, '');
}

/** Searches Adzuna's job API for one country and normalizes results into job-finder's shared job shape. */
async function searchAdzuna({ what, where, country, resultsPerPage = 20 }) {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    results_per_page: String(resultsPerPage),
    'content-type': 'application/json'
  });
  if (what) params.set('what', what);
  if (where) params.set('where', where);

  const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.display || `Adzuna API error (${res.status})`);

  const jobs = (data.results || []).map(job => ({
    public_slug: `adzuna-${job.id}`,
    title: stripHtml(job.title),
    company: job.company?.display_name || 'Unknown',
    location: job.location?.display_name || '',
    url: job.redirect_url,
    work_mode: null,
    posted_at: job.created,
    source_platform: 'adzuna',
    enrichment: {
      salary_min: job.salary_min ? Math.round(job.salary_min) : null,
      salary_max: job.salary_max ? Math.round(job.salary_max) : null,
      salary_currency: null,
      category: job.category?.label || null
    }
  }));

  return { jobs, total: data.count || jobs.length };
}

module.exports = { isConfigured, supportsCountry, searchAdzuna };
