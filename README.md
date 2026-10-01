# Wooblet

A customizable NFC + QR pet identification tag connected to an editable online pet profile. Built from [the MVP plan](./wooblet-mvp-development-plan.md).

## Applications

- **wooblet-web:** Next.js App Router, TypeScript, Tailwind CSS, Redux Toolkit / RTK Query, React Hook Form, Zod. Responsive storefront, customization preview, persistent cart, checkout, owner dashboard, public finder experience, and administrator studio.
- **wooblet-api:** NestJS, Mongoose / MongoDB, validated DTOs, cookie-based JWT access / rotating refresh sessions, Swagger, manual payment and fulfillment workflows, image uploads, QR generation, and consent-based finder reports.

## Local setup

Requires Node.js 24 and MongoDB (Docker Compose is provided).

```bash
npm install
npm run setup
# Start only this project's MongoDB; change MONGODB_URI if using an existing server.
docker compose up -d mongo
npm run seed
```

Run both applications with `npm run dev`, or use two terminals:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

- Website: http://localhost:3001
- MongoDB: `127.0.0.1:27018` (container port `27017`)
- API health: http://localhost:4001/api/health
- Swagger: http://localhost:4001/api/docs

`npm run setup` creates ignored development environment files with random secrets and a random admin password. It preserves existing files. The admin credentials are `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `wooblet-api/.env`. The seed command creates that account only if it does not exist, and adds five tag designs without overwriting existing products.

Development email verification and password-reset links are printed in the API terminal when SMTP is unset. Configure SMTP for real delivery. Local images are saved in `wooblet-api/uploads`; production requires S3-compatible storage and a public image URL.

## Try the core journey

1. Register an owner account and create a pet in **My pets**. Contact and medical details are private by default; explicitly enable a contact channel under public profile settings.
2. Customize a shop product, add it to your bag, and place an order. The API confirms prices and generates the immutable order number.
3. Sign in as the seeded admin, open **Orders**, and verify received payment. Move the order into production.
4. Open **Wooblets**, generate a batch, and immediately download the activation codes. They are returned once; only their hashes are stored.
5. Assign a generated tag to each order unit. Download its QR code and program its public URL into the NFC chip as an NDEF URL record. Package the corresponding activation code with the physical tag.
6. As the owner, tap/scan the tag, enter the eight-digit code, and select a pet. Activation claims the tag once and removes the activation-code hash.
7. Open the same URL without an account. It displays only permitted fields. Change the profile or Lost Mode and revisit the same tag URL to see the update.
8. A finder can contact the family and choose to share their current location. The owner sees the report in the dashboard.
9. Admins can disable tags or link an unallocated replacement to the existing profile.

For real phone testing, configure `FRONTEND_URL`, `API_URL`, and the web `NEXT_PUBLIC_*` values to a reachable HTTPS origin. `localhost` URLs will not reach your computer from another phone. Browser geolocation requires HTTPS (except localhost).

## Payments and fulfillment

Set `NEXT_PUBLIC_QRPH_IMAGE_URL` to the official QR Ph payment image and `NEXT_PUBLIC_FACEBOOK_URL` to the official page. The interface explicitly indicates when either is unconfigured. No real payment code, account, or Facebook destination is invented.

Payment and production are separate states. Verify actual received funds before marking an order paid. An order cannot skip lifecycle stages or become ready to ship until a physical tag is assigned to every unit. A tag cannot be allocated to two orders. Tracking numbers can be added when shipping.

Checkout requires an account in this implementation, so order details are protected by ownership. Activation uses the URL's public token in `POST /api/tags/:token/activate`; database IDs are reserved for authenticated management.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The API tests use a temporary isolated MongoDB, downloading its binary on first run. They cover ownership boundaries, role restrictions, privacy, server pricing, tag allocation and one-time activation, finder consent, replacements, refresh-token rotation, and logout revocation. No existing MongoDB data is used. Browser tests start isolated services on ports 3300 and 4400 and verify registration, pet creation, activation, privacy changes, geolocation consent, checkout, and admin payment verification. Run `npx playwright install chromium` once if Chromium is not already installed.

## Deployment configuration

- Use a stable production URL for tag programming; changing the domain later affects physical tags.
- Set `NODE_ENV=production`, unique random JWT secrets, MongoDB, SMTP, and S3 settings. Use HTTPS.
- Host the frontend and API under the same site (for example `wooblet.ph` and `api.wooblet.ph`), or reverse proxy `/api` to NestJS. Session cookies are HttpOnly, Secure in production, and SameSite=Lax. Cross-site hosting requires a deliberate cookie/CSRF design change.
- `FRONTEND_URL` must match the browser Origin exactly. Mutating requests require that Origin, including scripts and API clients. CORS accepts that origin with credentials.
- `SHIPPING_FEE` is a configurable flat Philippine peso amount (99 by default). Configure the real shipping policy before accepting orders.
- Set `S3_PUBLIC_URL` to the read-accessible bucket/CDN base URL. Restrict storage credentials and configure bucket access deliberately.
- If behind a proxy, configure trust-proxy appropriately for your infrastructure before launch so rate limiting uses the real client address.

## Remaining launch work

This repository implements the application workflows; it does not manufacture tags, verify bank transfers, or deploy a live service. Before launch, supply official payment/brand/product assets, finalize pricing and delivery/returns policies, review the clearly marked draft privacy/terms pages, configure production email/storage/domain, add infrastructure backups and monitoring, and perform NFC/QR tests on real iPhone and Android hardware. The product preview is illustrative SVG, not a physical printing or 3D configurator.

Public profile views are counted without GPS and retained for 90 days. Finder reports are created only with explicit consent. Owner and administrator list screens currently have bounded result sets; pagination and more advanced operations reporting are future extensions.
