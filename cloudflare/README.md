# Cloudflare hotel portal backend

This Worker is the persistent backend for the future `/admin` and `/owner` dashboards. It uses D1 for structured data and R2 for property images. Passwords are never stored in plain text.

## One-time setup

1. Log in with `npx wrangler login`.
2. In this folder, run `npx wrangler d1 create tiruchendur-stays` and replace `REPLACE_AFTER_CREATING_D1` in `wrangler.jsonc` with the returned database ID.
3. Create the photo bucket: `npx wrangler r2 bucket create tiruchendur-stays-photos`.
4. Apply the schema: `npx wrangler d1 execute tiruchendur-stays --remote --file=schema.sql`.
5. Add a long, random bootstrap token: `npx wrangler secret put BOOTSTRAP_TOKEN`.
6. Deploy: `npx wrangler deploy`.
7. Add a Cloudflare Worker custom domain such as `api.tiruchendurstay.in` and set `APP_ORIGIN` and `COOKIE_DOMAIN` to the final domains.
8. Call `POST /setup` once with the `X-Bootstrap-Token` header and the first admin username/password. Rotate the bootstrap secret immediately afterwards.

Never add `BOOTSTRAP_TOKEN`, Cloudflare API tokens, or user passwords to Git or a browser-visible environment variable.
