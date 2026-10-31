import { PrismaClient } from '@prisma/client';
import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end check for BP programs: admin linking (profile weight + event) and the
 * "Recommended programs" list on the dashboard.
 *
 * Requires a running app and a BP/SUPERADMIN account:
 *   E2E_EMAIL=... E2E_PASSWORD=... [E2E_BASE_URL=http://localhost:3000] \
 *   [E2E_BROWSER_CHANNEL=msedge] npx playwright test tests/programs.spec.ts --project=chromium
 * E2E_BROWSER_CHANNEL uses an installed browser instead of Playwright's downloaded Chromium.
 *
 * Test data is created with a unique "E2E" prefix and deleted afterwards.
 */

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const email = process.env.E2E_EMAIL ?? '';
const password = process.env.E2E_PASSWORD ?? '';

const runId = Date.now().toString(36);
const names = {
  profile: `E2E Profile ${runId}`,
  program: `E2E Program ${runId}`,
  eventlessProgram: `E2E Eventless Program ${runId}`,
  pastProgram: `E2E Past Program ${runId}`,
  upcomingEvent: `E2E Upcoming Event ${runId}`,
  pastEvent: `E2E Past Event ${runId}`,
};

const DAY = 24 * 60 * 60 * 1000;
const db = new PrismaClient();
let profileId = '';
const eventIds: string[] = [];

test.describe.configure({ mode: 'serial' });
test.use({ baseURL, channel: process.env.E2E_BROWSER_CHANNEL });

test.beforeAll(async () => {
  expect(email, 'Set E2E_EMAIL').not.toBe('');
  expect(password, 'Set E2E_PASSWORD').not.toBe('');

  const user = await db.user.findUniqueOrThrow({ where: { email } });

  // Standalone profile assigned to the test user, so it shows on their dashboard
  const profile = await db.profile.create({
    data: { name: names.profile, description: 'Created by tests/programs.spec.ts' },
  });
  profileId = profile.id;
  await db.userProfileProgress.create({ data: { userId: user.id, profileId } });

  const now = Date.now();
  const upcoming = await db.event.create({
    data: {
      title: names.upcomingEvent,
      start: new Date(now + 7 * DAY),
      end: new Date(now + 7 * DAY + 2 * 60 * 60 * 1000),
      createdById: user.id,
    },
  });
  const past = await db.event.create({
    data: {
      title: names.pastEvent,
      start: new Date(now - 7 * DAY),
      end: new Date(now - 7 * DAY + 2 * 60 * 60 * 1000),
      createdById: user.id,
    },
  });
  eventIds.push(upcoming.id, past.id);

  // Programs that must NOT be recommended: one without events, one whose event has ended
  await db.program.create({
    data: {
      name: names.eventlessProgram,
      relatedProfiles: { create: { profileId, progressToAdd: 5 } },
    },
  });
  await db.program.create({
    data: {
      name: names.pastProgram,
      relatedProfiles: { create: { profileId, progressToAdd: 5 } },
      relatedEvents: { create: { eventId: past.id } },
    },
  });
});

test.afterAll(async () => {
  await db.program.deleteMany({ where: { name: { endsWith: runId, startsWith: 'E2E' } } });
  await db.event.deleteMany({ where: { id: { in: eventIds } } });
  if (profileId) await db.profile.delete({ where: { id: profileId } }).catch(() => undefined);
  await db.$disconnect();
});

async function signIn(page: Page) {
  await page.goto('/auth/sign-in');
  // The password label points at a wrapper div, so target inputs by name
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/dashboard', { timeout: 60_000 });
}

async function selectOption(page: Page, search: string, option: string) {
  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder(/^Search (profiles|events)/).fill(search);
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: option }).click();
}

test('BP admin creates a program and links a weighted profile and an event', async ({ page }) => {
  test.setTimeout(180_000);
  await signIn(page);

  await page.goto('/admin/programs');
  await expect(page.getByRole('heading', { name: 'Programs' })).toBeVisible({ timeout: 60_000 });

  // Create program
  await page.getByRole('button', { name: 'Create Program' }).click();
  await page.getByLabel('Name').fill(names.program);
  await page.getByLabel('Description').fill('Program created by the E2E test');
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByText('Program created successfully')).toBeVisible();

  await page.getByPlaceholder('Search programs by name or description...').fill(names.program);
  const row = page.getByRole('row').filter({ hasText: names.program });
  await expect(row).toHaveCount(1);

  // Link profile with weight 15
  await row.getByRole('button', { name: 'Link Profile' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('No profiles linked yet')).toBeVisible();
  await selectOption(page, names.profile, names.profile);
  await dialog.getByLabel('Points/Progress (%)').fill('15');
  await dialog.getByRole('button', { name: 'Link', exact: true }).click();
  await expect(page.getByText('Profile linked to program successfully')).toBeVisible();

  // Linked row shows the weight; editing it to 20 saves
  const weightInput = dialog.getByLabel(`Progress for ${names.profile}`);
  await expect(weightInput).toHaveValue('15');
  await weightInput.fill('20');
  await dialog.getByRole('button', { name: 'Save weight' }).click();
  await expect(page.getByText('Profile weight updated successfully')).toBeVisible();
  await expect(weightInput).toHaveValue('20');

  // Out-of-range weight is rejected client-side
  await dialog.getByLabel('Points/Progress (%)').fill('150');
  await expect(dialog.getByText('Enter a whole number from 0 to 100')).toBeVisible();
  await page.keyboard.press('Escape');

  // Link the upcoming event
  await row.getByRole('button', { name: 'Link Event' }).click();
  await expect(dialog.getByText('No events linked yet')).toBeVisible();
  await selectOption(page, names.upcomingEvent, names.upcomingEvent);
  await dialog.getByRole('button', { name: 'Link', exact: true }).click();
  await expect(page.getByText('Event linked to program successfully')).toBeVisible();
  await expect(dialog.getByText(names.upcomingEvent)).toBeVisible();
  await page.keyboard.press('Escape');

  // Row counts: 1 profile, 1 event
  await expect(row.getByRole('cell').nth(1)).toHaveText('1');
  await expect(row.getByRole('cell').nth(2)).toHaveText('1');
});

test('dashboard recommends only programs with upcoming events', async ({ page }) => {
  test.setTimeout(120_000);
  await signIn(page);

  await page.getByRole('button', { name: /Standalone Profiles/ }).click();
  const profileBlock = page
    .locator('div.space-y-2')
    .filter({ has: page.getByText(names.profile, { exact: true }) });
  await expect(profileBlock.getByText('Recommended events to participate')).toBeVisible();

  // Only the event name is listed, once, without program name or weight
  await expect(profileBlock.getByText(names.upcomingEvent, { exact: true })).toHaveCount(1);
  await expect(profileBlock.getByText(names.program)).toHaveCount(0);
  await expect(profileBlock.getByText('+20%')).toHaveCount(0);

  // Not recommended: programs without events, or with only past events
  await expect(profileBlock.getByText(names.eventlessProgram)).toHaveCount(0);
  await expect(profileBlock.getByText(names.pastProgram)).toHaveCount(0);
  await expect(profileBlock.getByText(names.pastEvent)).toHaveCount(0);
});
