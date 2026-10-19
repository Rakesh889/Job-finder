# Job Finder

A small web app that searches live job postings via [freehire.me](https://freehire.me)'s public API — real jobs crawled directly from company career pages, no recruiter reposts.

## Features

- Full-text search by title/skill/keyword
- Filter by work mode (remote/hybrid/onsite) and seniority
- Results show company, location, salary (when available), and posting age
- Each result links straight to the original job posting

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3600 (override with a `PORT` env var).

## How it works

`server.js` is a thin Express proxy to freehire's keyless public search API (`https://freehire.me/api/v1/jobs/search`), so the browser never has to deal with CORS. `public/index.html` is a single-page UI with no build step.

## License

MIT
