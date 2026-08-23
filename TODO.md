# TODO: Cloudflare Hotel Owner Portal

## Completed
- [x] Installed Wrangler and authenticated the Cloudflare account.
- [x] Created production D1 database `tiruchendur-stays` in APAC.
- [x] Applied and verified the D1 schema in `cloudflare/schema.sql`.
- [x] Enabled R2 and created photo bucket `tiruchendur-stays-photos`.
- [x] Added Worker code and configuration in `cloudflare/`.
- [x] Validated Worker bindings with `npx wrangler deploy --dry-run --config=cloudflare/wrangler.jsonc`.

## Resume here
- [x] In Cloudflare, choose an available Workers subdomain at:
  `https://dash.cloudflare.com/0d8ce3814a512b9a251eedf3fdac6ad0/workers/onboarding`
- [x] Verify authentication: `npx wrangler whoami`
- [x] Deploy the Worker:
  `npx wrangler deploy --config=cloudflare/wrangler.jsonc`
- [x] Worker deployed at `https://tiruchendur-stays-api.tiruchendur-stays-api.workers.dev`.
- [x] Selected the Next.js same-origin proxy approach, so no Cloudflare DNS migration or `api.tiruchendurstay.in` custom domain is required. The site will forward `/api/portal/*` to the Worker and store the secure session cookie on its own domain.
- [x] Set a long random one-time bootstrap secret interactively:
  `npx wrangler secret put BOOTSTRAP_TOKEN --config=cloudflare/wrangler.jsonc`
- [ ] Call `POST /setup` once using the bootstrap token to create the first admin account, then remove/rotate the bootstrap secret.
- [ ] Add custom domain `api.tiruchendurstay.in` if the main domain is managed in Cloudflare; update `APP_ORIGIN` and `COOKIE_DOMAIN` in `cloudflare/wrangler.jsonc` before redeploying.
- [x] Build the `/admin` and `/owner` interfaces in the Next.js site and configure them with the Worker API URL through the same-origin `/api/portal/*` proxy.

## Security rules
- Never put Cloudflare API tokens, `BOOTSTRAP_TOKEN`, passwords, or production cookies in Git, `.env.example`, or browser-visible `NEXT_PUBLIC_*` secrets.
- Owner passwords are hashed in D1. Only an admin can create owner accounts.
- Do not mark a booking confirmed until payment and availability checks complete.

# TODO: Organize Property Photos into Per-Property Folders

## Steps
- [x] Step 0: Gather requirements and get user confirmation
- [x] Step 1: Create property folders (1/ through 6/)
- [x] Step 2: Copy hotel images into respective property folders
- [x] Step 3: Update lib/hotels.ts (fallback hotel image paths + toHotel FLH mapping)
- [x] Step 4: Update tests/hotels.test.ts (mock hotel image paths)
- [x] Step 5: Verify the build works ✓ (Build completed successfully)

