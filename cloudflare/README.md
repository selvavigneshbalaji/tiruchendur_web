# Cloudflare hotel portal backend

This Worker is the persistent backend for the future `/admin` and `/owner` dashboards. It uses D1 for structured data and R2 for property images. Passwords are never stored in plain text.

## One-time setup

1. Log in with `npx wrangler login`.
2. In this folder, run `npx wrangler d1 create tiruchendur-stays` and replace `REPLACE_AFTER_CREATING_D1` in `wrangler.jsonc` with the returned database ID.
3. In the Cloudflare dashboard, open **R2 Object Storage** once and complete its activation. Cloudflare requires this one-time account setup before any R2 bucket can be created.
4. Create the photo bucket: `npx wrangler r2 bucket create tiruchendur-stays-photos`.
5. Apply the schema: `npx wrangler d1 execute tiruchendur-stays --remote --file=schema.sql`.
6. Add a long, random bootstrap token: `npx wrangler secret put BOOTSTRAP_TOKEN`.
7. Deploy: `npx wrangler deploy`.
8. Add a Cloudflare Worker custom domain such as `api.tiruchendurstay.in` and set `APP_ORIGIN` and `COOKIE_DOMAIN` to the final domains.
9. Call `POST /setup` once with the `X-Bootstrap-Token` header and the first admin username/password. Rotate the bootstrap secret immediately afterwards.

Never add `BOOTSTRAP_TOKEN`, Cloudflare API tokens, or user passwords to Git or a browser-visible environment variable.
