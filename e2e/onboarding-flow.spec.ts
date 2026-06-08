import { test, expect } from '@playwright/test';

test.describe('Onboarding flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear persisted state so onboarding always starts fresh
    await page.goto('http://localhost:4201/onboarding', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:4201/onboarding', { waitUntil: 'networkidle' });
  });

  // ── Demo step ──────────────────────────────────────────────────────────

  test('demo step: renders question card and answer grid', async ({ page }) => {
    await expect(page.locator('app-question-card')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.answer-grid')).toBeVisible();
  });

  test('demo step: answer buttons are present and at least 12 rendered', async ({ page }) => {
    const buttons = page.locator('.ans');
    await expect(buttons.first()).toBeVisible({ timeout: 5000 });
    expect(await buttons.count()).toBe(12);
  });

  test('demo step: hint text shows F1 label before any answer', async ({ page }) => {
    await expect(page.locator('.demo-hint')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.hint-key')).toContainText('F1');
  });

  test('demo step: correct answer triggers green flash and explained section', async ({ page }) => {
    // First button is Present Simple (F1) — the correct demo answer
    const firstBtn = page.locator('.ans').first();
    await firstBtn.waitFor({ state: 'visible', timeout: 5000 });
    await firstBtn.click();

    // Hint disappears, explained block appears
    await expect(page.locator('.demo-hint')).not.toBeVisible();
    await expect(page.locator('.demo-explained')).toBeVisible({ timeout: 2000 });
  });

  test('demo step: wrong answer still reveals explained section', async ({ page }) => {
    // Second button is Present Continuous (F2) — wrong for the demo
    const secondBtn = page.locator('.ans').nth(1);
    await secondBtn.waitFor({ state: 'visible', timeout: 5000 });
    await secondBtn.click();

    await expect(page.locator('.demo-explained')).toBeVisible({ timeout: 2000 });
  });

  test('demo step: F1 keyboard shortcut works as correct answer', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.keyboard.press('F1');

    await expect(page.locator('.demo-explained')).toBeVisible({ timeout: 2000 });
  });

  test('demo step: "Start training" CTA appears after answering', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();

    const ctaBtn = page.locator('button.ob-cta:has-text("Начать тренировку")');
    await expect(ctaBtn).toBeVisible({ timeout: 2000 });
  });

  // ── Game step ──────────────────────────────────────────────────────────

  test('game step: question card and answer grid visible after starting', async ({ page }) => {
    // Answer demo and start training
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    await expect(page.locator('app-question-card')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.answer-grid')).toBeVisible();
  });

  test('game step: progress indicator shows 1 / 5 on first question', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    await page.locator('.prog-label').waitFor({ state: 'visible', timeout: 5000 });
    await expect(page.locator('.prog-label')).toContainText('1 / 5');
  });

  test('game step: score bar is visible during the session', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    await expect(page.locator('app-score-bar')).toBeVisible({ timeout: 5000 });
  });

  test('game step: answering a question advances the progress counter', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    await page.locator('.prog-label').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();

    // After result flash + advance, progress should read 2 / 5
    await expect(page.locator('.prog-label')).toContainText('2 / 5', { timeout: 3000 });
  });

  // ── Full flow → save-prompt ────────────────────────────────────────────

  test('full flow: completing 5 questions shows the save-prompt card', async ({ page }) => {
    // Skip through demo
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    // Answer all 5 game questions
    for (let i = 0; i < 5; i++) {
      const btn = page.locator('.ans').first();
      await btn.waitFor({ state: 'visible', timeout: 5000 });
      await btn.click();
      // Wait for the result flash to clear (≤ 1050 ms)
      await page.waitForTimeout(1200);
    }

    await expect(page.locator('.sp-card')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.sp-title')).toContainText('Тренировка завершена');
  });

  test('full flow: save-prompt shows inferred level', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('.ans').first().click();
      await page.waitForTimeout(1200);
    }

    await page.locator('.sp-stats').waitFor({ state: 'visible', timeout: 5000 });
    const statsText = await page.locator('.sp-stats').textContent();
    const levels = ['Начинающий', 'Средний', 'Продвинутый'];
    expect(levels.some((lvl) => statsText?.includes(lvl))).toBe(true);
  });

  // ── Save-prompt actions ────────────────────────────────────────────────

  test('save-prompt: "Continue without account" navigates to /home', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('.ans').first().click();
      await page.waitForTimeout(1200);
    }

    await page.locator('.sp-card').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button.ob-cta.secondary').click();

    await page.waitForURL('**/home', { timeout: 5000 });
    expect(page.url()).toContain('/home');
  });

  test('save-prompt: after completing onboarding, home no longer redirects', async ({ page }) => {
    // Complete onboarding
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    for (let i = 0; i < 5; i++) {
      await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('.ans').first().click();
      await page.waitForTimeout(1200);
    }

    await page.locator('.sp-card').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button.ob-cta.secondary').click();
    await page.waitForURL('**/home', { timeout: 5000 });

    // Navigating to /home again should stay on /home (onboarding seen)
    await page.goto('http://localhost:4201/home', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/home');
    expect(page.url()).not.toContain('/onboarding');
  });

  // ── Skip button ───────────────────────────────────────────────────────

  test('skip button is visible on the demo step', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(page.locator('button.ob-skip')).toBeVisible();
    await expect(page.locator('button.ob-skip')).toContainText('Пропустить');
  });

  test('skip on demo step navigates directly to /home', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button.ob-skip').click();
    await page.waitForURL('**/home', { timeout: 5000 });
    expect(page.url()).toContain('/home');
  });

  test('skip button is visible on the game step', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    await page.locator('.prog-label').waitFor({ state: 'visible', timeout: 5000 });
    await expect(page.locator('button.ob-skip')).toBeVisible();
  });

  test('skip on game step navigates directly to /home', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('.ans').first().click();
    await page.locator('button.ob-cta:has-text("Начать тренировку")').click({ timeout: 3000 });

    await page.locator('.prog-label').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button.ob-skip').click();
    await page.waitForURL('**/home', { timeout: 5000 });
    expect(page.url()).toContain('/home');
  });

  test('skip marks onboarding as seen — home no longer redirects', async ({ page }) => {
    await page.locator('.ans').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button.ob-skip').click();
    await page.waitForURL('**/home', { timeout: 5000 });

    // Reload home — should stay on /home, not redirect back to /onboarding
    await page.goto('http://localhost:4201/home', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/home');
    expect(page.url()).not.toContain('/onboarding');
  });

  // ── Home → onboarding redirect ─────────────────────────────────────────

  test('home page redirects first-time visitors to /onboarding', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:4201/home', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/onboarding');
  });
});
