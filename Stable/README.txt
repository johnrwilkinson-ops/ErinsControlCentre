# ECC Netlify Functions (Blobs + manual fallback)

## Files
- `netlify/functions/get-state.mjs` — reads the current room state
- `netlify/functions/save-state.mjs` — writes state for a room
- `netlify.toml` — configures bundler and headers
- `package.json` — marks the project as ESM and declares `@netlify/blobs`

## Environment variables (Netlify → Project → Settings → Environment)
- `BLOBS_SITE_ID` = your Netlify **Project ID**
- `BLOBS_TOKEN`   = a Netlify **Personal access token**
  - `NETLIFY_API_TOKEN` / `NETLIFY_AUTH_TOKEN` also work

These are only used if the platform doesn’t auto-inject Blobs. Otherwise the functions use the built-in context.
