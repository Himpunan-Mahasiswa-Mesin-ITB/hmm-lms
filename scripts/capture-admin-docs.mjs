// Captures the screenshots used by the admin documentation (content/docs/admin).
//
// Usage (dev server must be running, account must have an admin role):
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret node scripts/capture-admin-docs.mjs
//
// Optional env: BASE_URL (default http://localhost:3000), BROWSER_CHANNEL (default msedge; use "chrome" if preferred)
// Output: public/images/docs/admin-guide/<name>.png
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD.');
  process.exit(1);
}

const OUT = 'public/images/docs/admin-guide';
mkdirSync(OUT, { recursive: true });

// [file name, route, optional action run before the shot]
const shots = [
  [
    'dashboard',
    '/admin',
    async (page) => {
      // Expand the sidebar so the menu is visible in the shot.
      await page.locator('[data-sidebar="trigger"]').first().click().catch(() => {});
      await page.waitForTimeout(1000);
    },
  ],
  ['analytics', '/admin/analytics'],
  ['forms', '/admin/forms'],
  ['forms-create', '/admin/forms/create'],
  ['shortlinks', '/admin/shortlinks'],
  ['shortlinks-create', '/admin/shortlinks/create'],
  ['courses', '/admin/courses'],
  ['courses-create', '/admin/courses/create'],
  ['scholarships', '/admin/scholarships'],
  ['scholarships-create', '/admin/scholarships/create'],
  ['tryouts', '/admin/tryouts'],
  ['tryouts-create', '/admin/tryouts/create'],
  ['announcements', '/admin/announcements'],
  ['announcements-create', '/admin/announcements/create'],
  ['events', '/admin/events'],
  ['events-create', '/admin/events/create'],
  [
    'loker',
    '/admin/loker',
    async (page) => {
      await page.getByRole('button', { name: /create|add|new/i }).first().click();
      await page.waitForTimeout(800);
    },
  ],
  ['users', '/admin/users'],
  ['database', '/admin/database'],
  ['profiles', '/admin/profiles'],
  ['event-profiles', '/admin/event-profiles'],
  ['machining-batch', '/admin/machining-batch'],
  ['superadmin-area', '/admin/superadmin-area'],
];

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE_URL}/auth/sign-in`, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${OUT}/sign-in.png` });
// The form can be submitted natively before React hydrates (page just reloads), so retry.
for (let attempt = 1; ; attempt++) {
  await page.waitForTimeout(3000);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 45_000 });
    break;
  } catch (err) {
    if (attempt >= 3) throw err;
    await page.goto(`${BASE_URL}/auth/sign-in`, { waitUntil: 'networkidle' });
  }
}

// Hide the Next.js dev indicator so shots are clean.
const CSS = 'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] { display: none !important; }';
const LOADING = /^\s*(Loading|Fetching)[^\n]*(\.\.\.|…)\s*$/m;

async function waitForContent(page) {
  // Dev compiles can take a while: wait until loading placeholders are gone.
  await page
    .waitForFunction((src) => !new RegExp(src, 'm').test(document.body.innerText) && document.querySelector('h1, h2, table') !== null, LOADING.source, {
      timeout: 120_000,
    })
    .catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(2500);
}

const only = process.env.ONLY?.split(',');
for (const [name, route, action] of shots) {
  if (only && !only.includes(name)) continue;
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await page.addStyleTag({ content: CSS });
    await waitForContent(page);
    if (action) await action(page);
    await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 120_000, animations: 'disabled' });
    console.log('captured', name);
  } catch (err) {
    console.error('failed', name, err.message.split('\n')[0]);
  }
}

await browser.close();
