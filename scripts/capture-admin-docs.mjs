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
  ['dashboard', '/admin'],
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
await page.fill('input[name="email"]', ADMIN_EMAIL);
await page.fill('input[name="password"]', ADMIN_PASSWORD);
await page.keyboard.press('Enter');
await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 60_000 });

for (const [name, route, action] of shots) {
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 90_000 });
    await page.waitForTimeout(1500);
    if (action) await action(page);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('captured', name);
  } catch (err) {
    console.error('failed', name, err.message);
  }
}

await browser.close();
