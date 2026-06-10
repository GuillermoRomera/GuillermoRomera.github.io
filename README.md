# Sentiment Dashboard — Demo

An interactive customer-sentiment dashboard (NPS + CES trends, KPI summaries, and a filterable verbatim-comment feed) for two fictional platforms, **Lumora** and **Vextra**.

> **All data is synthetic.** Companies, accounts, scores, dates, and comments are fictional and for demonstration only.

## Deploy to GitHub Pages (no build needed)

The repo ships with a prebuilt static site in `docs/`:

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`, branch `main`, folder `/docs`.
4. Save. Your dashboard will be live at `https://<username>.github.io/<repo>/` in a minute or two.

Alternatively, the included GitHub Actions workflow (`.github/workflows/deploy.yml`) rebuilds and deploys automatically on every push to `main` — set **Settings → Pages → Source** to `GitHub Actions` to use it.

## Local development

```bash
npm install
npm run build   # bundles src/ into docs/bundle.js
npm run serve   # serves docs/ at http://localhost:3000
```

## Editing the data

Open `src/SentimentDashboard.jsx` and edit only the block between `DATA START` and `DATA END`:

- `MONTHS` — x-axis labels
- `LM` / `VX` — monthly NPS net scores and CES averages (with response counts) per platform; use `null` where a series has ended
- `SUMMARY` — the 6-month KPI numbers shown in each panel header
- `NOTES` — optional footnote per panel
- `raw` — the comment feed rows: `[platform, type, date, score, account|null, text]`

Then run `npm run build` and commit the updated `docs/bundle.js`.

## Stack

React 18 + Recharts, bundled with esbuild into a single static file. No server, no framework — just `docs/index.html` + `docs/bundle.js`.
