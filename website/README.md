# GDPI Marketing Website (Next.js)

This folder contains the public, SEO-friendly marketing site for GDPI (pricing, how it works, Arizona Price Index, request demo, security/privacy).

The **AI quote analysis experience currently lives in the Expo mobile app at the repo root** (not in this website).

## Getting Started

Install dependencies from this folder:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Pages live in `src/app/*` (App Router). The dev server auto-updates as you edit files.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notes

- Some premium “proof check” details (e.g., balance-test steps) are intentionally not shown on public pages.
- If you want a gated web analyzer, add auth/subscription + a protected “Analyze Quote” route and server-side API calls.

Next.js docs: <https://nextjs.org/docs>
