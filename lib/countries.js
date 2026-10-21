// freehire's `countries` filter expects ISO 3166-1 alpha-2 codes, but typing
// the country name is the natural thing to do — normalize common names so
// "India" works the same as "IN" instead of silently returning zero results.
const NAME_TO_CODE = {
  india: 'IN', 'united states': 'US', usa: 'US', us: 'US', america: 'US',
  'united kingdom': 'GB', uk: 'GB', britain: 'GB',
  germany: 'DE', france: 'FR', spain: 'ES', italy: 'IT', netherlands: 'NL',
  poland: 'PL', portugal: 'PT', ireland: 'IE', sweden: 'SE', norway: 'NO',
  denmark: 'DK', finland: 'FI', switzerland: 'CH', austria: 'AT', belgium: 'BE',
  ukraine: 'UA', russia: 'RU', romania: 'RO', 'czech republic': 'CZ', czechia: 'CZ',
  canada: 'CA', mexico: 'MX', brazil: 'BR', argentina: 'AR', chile: 'CL', colombia: 'CO',
  china: 'CN', japan: 'JP', 'south korea': 'KR', korea: 'KR', singapore: 'SG',
  indonesia: 'ID', philippines: 'PH', vietnam: 'VN', thailand: 'TH', malaysia: 'MY',
  pakistan: 'PK', bangladesh: 'BD', 'sri lanka': 'LK',
  australia: 'AU', 'new zealand': 'NZ',
  'south africa': 'ZA', nigeria: 'NG', egypt: 'EG', kenya: 'KE',
  israel: 'IL', uae: 'AE', 'united arab emirates': 'AE', 'saudi arabia': 'SA', turkey: 'TR'
};

/** Normalizes a comma-separated list of country names/codes into ISO codes where recognized, passing through anything already code-shaped or unrecognized. */
function normalizeCountries(input) {
  return input
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => NAME_TO_CODE[part.toLowerCase()] || part)
    .join(',');
}

// One clean display name per code, for rendering autocomplete suggestions
// (facet data from the API only gives lowercase codes, not readable names).
const CODE_TO_NAME = {
  IN: 'India', US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France',
  ES: 'Spain', IT: 'Italy', NL: 'Netherlands', PL: 'Poland', PT: 'Portugal', IE: 'Ireland',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', CH: 'Switzerland', AT: 'Austria',
  BE: 'Belgium', UA: 'Ukraine', RU: 'Russia', RO: 'Romania', CZ: 'Czech Republic',
  CA: 'Canada', MX: 'Mexico', BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia',
  CN: 'China', JP: 'Japan', KR: 'South Korea', SG: 'Singapore', ID: 'Indonesia',
  PH: 'Philippines', VN: 'Vietnam', TH: 'Thailand', MY: 'Malaysia', PK: 'Pakistan',
  BD: 'Bangladesh', LK: 'Sri Lanka', AU: 'Australia', NZ: 'New Zealand',
  ZA: 'South Africa', NG: 'Nigeria', EG: 'Egypt', KE: 'Kenya',
  IL: 'Israel', AE: 'United Arab Emirates', SA: 'Saudi Arabia', TR: 'Turkey'
};

function countryDisplayName(code) {
  return CODE_TO_NAME[code.toUpperCase()] || code.toUpperCase();
}

module.exports = { normalizeCountries, countryDisplayName };
