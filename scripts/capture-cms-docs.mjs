// Captures the screenshots used by the Payload CMS guide (content/docs/admin/(onboarding)/cms-posts.mdx).
//
// Usage (dev server must be running, account must have an admin role):
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret node scripts/capture-cms-docs.mjs
//
// Optional env: BASE_URL (default http://localhost:3000), BROWSER_CHANNEL (default msedge; use "chrome" if preferred)
// Output: public/images/docs/admin-guide/cms-<name>.png
//
// The script creates a temporary draft News post for the editor shots and deletes it again at the end.
// Nothing is published and no media is uploaded.
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

// Hide the Next.js dev indicator so shots are clean.
const CSS = 'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] { display: none !important; }';

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(180_000);

async function shot(name) {
  await page.addStyleTag({ content: CSS });
  // Clicking into fields scrolls the page; keep the document header in every shot.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/cms-${name}.png`, animations: 'disabled' });
  console.log('captured', name);
}

async function fillLogin() {
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
}

// 1. Sign in to the LMS (this also syncs the account to Payload).
await page.goto(`${BASE_URL}/auth/sign-in`, { waitUntil: 'load' });
// The form can be submitted natively before React hydrates (page just reloads), so retry.
for (let attempt = 1; ; attempt++) {
  await page.waitForTimeout(3000);
  await fillLogin();
  try {
    await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 60_000 });
    break;
  } catch (err) {
    if (attempt >= 3) throw err;
    await page.goto(`${BASE_URL}/auth/sign-in`, { waitUntil: 'load' });
  }
}

// 2. The "Content Panel" entry in the LMS admin sidebar.
await page.goto(`${BASE_URL}/admin`, { waitUntil: 'load' });
await page.waitForSelector('text=Content Panel', { state: 'attached' });
await page.locator('[data-sidebar="trigger"]').first().click().catch(() => {});
await page.waitForTimeout(1000);
await page.getByText('Content Panel').first().scrollIntoViewIfNeeded();
await shot('lms-sidebar');

// 3. Payload login and dashboard.
await page.goto(`${BASE_URL}/admin-cms/login`, { waitUntil: 'load' });
await page.waitForSelector('input[name="email"]');
await shot('login');
await fillLogin();
await page.waitForURL((url) => !url.pathname.includes('/login'));
await page.waitForSelector('text=Content Pillar');
await shot('dashboard');

// 4. News list.
await page.goto(`${BASE_URL}/admin-cms/collections/news`, { waitUntil: 'load' });
await page.waitForSelector('text=Create New');
await shot('news-list');

// 5. Editor: opening "Create New" immediately saves a draft (autosave), so remember its id for cleanup.
await page.goto(`${BASE_URL}/admin-cms/collections/news/create`, { waitUntil: 'load' });
await page.waitForURL(/\/collections\/news\/\d+/);
const draftId = page.url().match(/\/collections\/news\/(\d+)/)[1];

try {
  await page.fill('input[name="title"]', 'HMM Mechanical Expo 2026 Opens Registration');
  const body = page.locator('.rich-text-lexical [contenteditable="true"]').first();
  await body.click();
  await page.keyboard.type(
    'Registration for HMM Mechanical Expo 2026 is now open for all members. Read on for the schedule and how to sign up.',
  );
  await shot('editor');

  // Slash menu with the available blocks.
  await page.keyboard.press('Enter');
  await page.keyboard.type('/');
  await page.waitForTimeout(1000);
  await shot('slash-menu');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');

  // Cover image upload drawer (closed again without uploading).
  await page.getByRole('button', { name: 'Create New' }).first().click();
  await page.waitForTimeout(1500);
  await shot('cover-upload');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // News Details tab.
  await page.locator('.tabs-field__tab-button', { hasText: 'News Details' }).click();
  await page.fill('textarea[name="summary"]', 'Registration for HMM Mechanical Expo 2026 is open until 15 November.');
  await page.getByRole('button', { name: 'Add Tag' }).click();
  await page.locator('input[name="tags.0.tag"]').fill('Event');
  await shot('news-details');

  // SEO tab.
  await page.locator('.tabs-field__tab-button', { hasText: 'SEO' }).click();
  await shot('seo');

  // Sidebar: Publishing Status dropdown.
  await page.locator('.tabs-field__tab-button', { hasText: 'Content' }).click();
  await page.locator('#field-status').click();
  await page.waitForTimeout(800);
  await shot('status');
  await page.keyboard.press('Escape');

  // Publish button dropdown (schedule publish).
  // The chevron sits directly to the right of "Publish changes".
  const publish = await page.getByRole('button', { name: 'Publish changes' }).boundingBox();
  await page.mouse.click(publish.x + publish.width + 16, publish.y + publish.height / 2);
  await page.waitForTimeout(800);
  await shot('publish-menu');
  await page.keyboard.press('Escape');
} finally {
  // Remove the temporary draft (the Payload session cookie authorises the request).
  const res = await page.request.delete(`${BASE_URL}/api/news/${draftId}`);
  console.log(`deleted draft ${draftId}:`, res.status());
}

await browser.close();
