# Webapp Testing Skill (Playwright E2E)

**Auto-applies when:** Testing frontend flows, validating UI behavior, or verifying end-to-end user journeys.

## Purpose

Test complete user flows from browser to ensure:
- Portal Registry + Frontend are properly wired
- Correct portal URLs appear for each state/city/task
- Task cards render with proper prerequisites and timelines
- User interactions work as expected

## Setup

```bash
# Install Playwright
cd frontend-v2
npm install -D @playwright/test
npx playwright install

# Create test directory
mkdir -p tests/e2e
```

## Core E2E Test Patterns

### 1. Relocation Flow Tests

**Test: Bangalore Domicile Certificate**
```javascript
// tests/e2e/bangalore-domicile.spec.js
import { test, expect } from '@playwright/test';

test('Relocating to Bangalore - Domicile Certificate flow', async ({ page }) => {
  // Navigate to dashboard
  await page.goto('http://localhost:5174');

  // Create new life event
  await page.click('text=ADD AN EVENT');
  await page.fill('input[placeholder*="life event"]', 'Relocating to Bangalore for new job');
  await page.click('button:has-text("Analyze")');

  // Wait for workflow generation
  await page.waitForSelector('text=Proposed Tasks', { timeout: 30000 });

  // Verify domicile certificate task exists
  const domicileTask = page.locator('text=Domicile Certificate');
  await expect(domicileTask).toBeVisible();

  // Approve workflow
  await page.click('button:has-text("Approve")');

  // Navigate to task detail
  await page.click('text=Domicile Certificate');

  // Verify Seva Sindhu portal button
  const portalButton = page.locator('button:has-text("Open Seva Sindhu")');
  await expect(portalButton).toBeVisible();

  // Verify portal URL
  const portalUrl = await portalButton.getAttribute('onclick');
  expect(portalUrl).toContain('sevasindhu.karnataka.gov.in');

  // Verify prerequisites are shown
  await expect(page.locator('text=Aadhaar')).toBeVisible();
  await expect(page.locator('text=Proof of Residence')).toBeVisible();
});
```

**Test: Pune Rent Agreement (Offline Path)**
```javascript
test('Pune Rent Agreement shows offline process', async ({ page }) => {
  await page.goto('http://localhost:5174');

  await page.fill('input', 'Relocating to Pune for IT job');
  await page.click('button:has-text("Analyze")');
  await page.waitForSelector('text=Rent Agreement');

  await page.click('button:has-text("Approve")');
  await page.click('text=Rent Agreement');

  // Verify offline note appears
  await expect(page.locator('text=Sub-Registrar Office')).toBeVisible();
  await expect(page.locator('text=offline')).toBeVisible();

  // Verify NO online portal button (since it's offline)
  const portalButton = page.locator('button:has-text("Open Portal")');
  await expect(portalButton).not.toBeVisible();
});
```

### 2. Portal Registry Validation Tests

```javascript
test('All KA tasks show Seva Sindhu portal', async ({ page }) => {
  const kaTasks = ['Domicile Certificate', 'Ration Card', 'Birth Certificate'];

  for (const taskName of kaTasks) {
    // Create task for Bangalore
    await createTask(page, taskName, 'Bangalore');

    // Verify Seva Sindhu portal
    const portalButton = page.locator('button:has-text("Open Seva Sindhu")');
    await expect(portalButton).toBeVisible();
  }
});

test('MH tasks show correct regional portals', async ({ page }) => {
  // Mumbai → Aaple Sarkar
  await createTask(page, 'Domicile Certificate', 'Mumbai');
  await expect(page.locator('text=Aaple Sarkar')).toBeVisible();

  // Pune → Aaple Sarkar (same)
  await createTask(page, 'Domicile Certificate', 'Pune');
  await expect(page.locator('text=Aaple Sarkar')).toBeVisible();
});
```

### 3. Task Timeline Tests

```javascript
test('Task shows correct timeline from registry', async ({ page }) => {
  await createTask(page, 'Voter ID Address Change', 'Bangalore');

  // Verify timeline dates
  const timelineText = await page.locator('[data-testid="task-timeline"]').textContent();

  // Should show dates based on timeline_buffers from registry
  expect(timelineText).toMatch(/Initial submission: \d{1,2}\/\d{1,2}\/\d{4}/);
  expect(timelineText).toMatch(/Follow-up: \d{1,2}\/\d{1,2}\/\d{4}/);
});
```

### 4. URN Extraction Tests (with Mock Upload)

```javascript
test('Upload Aadhaar receipt and extract URN', async ({ page }) => {
  await page.goto('http://localhost:5174/tasks/1');

  // Upload mock Aadhaar acknowledgement
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'aadhaar-ack.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('mock image data')
  });

  // Wait for OCR/Gemini processing
  await page.waitForSelector('text=Reference ID extracted', { timeout: 15000 });

  // Verify URN appears
  const urnDisplay = page.locator('[data-testid="extracted-urn"]');
  await expect(urnDisplay).toHaveText(/\d{4}\/\d{5}\/\d{5}/);

  // Verify task status updated
  await expect(page.locator('text=Pending Verification')).toBeVisible();
});
```

## Test Organization

```
frontend-v2/
└── tests/
    └── e2e/
        ├── flows/
        │   ├── bangalore-relocation.spec.js
        │   ├── pune-relocation.spec.js
        │   └── delhi-relocation.spec.js
        ├── portals/
        │   ├── portal-registry.spec.js
        │   └── offline-tasks.spec.js
        ├── tasks/
        │   ├── task-timeline.spec.js
        │   ├── task-prerequisites.spec.js
        │   └── urn-extraction.spec.js
        └── helpers/
            └── test-utils.js
```

## Helper Functions

```javascript
// tests/e2e/helpers/test-utils.js
export async function createTask(page, taskName, city) {
  await page.goto('http://localhost:5174');
  await page.fill('input', `${taskName} in ${city}`);
  await page.click('button:has-text("Analyze")');
  await page.waitForSelector(`text=${taskName}`);
  await page.click('button:has-text("Approve")');
  await page.click(`text=${taskName}`);
}

export async function verifyPortalButton(page, portalName, expectedUrl) {
  const button = page.locator(`button:has-text("Open ${portalName}")`);
  await expect(button).toBeVisible();

  const url = await button.evaluate(el =>
    el.onclick?.toString().match(/window\.open\(['"](.+?)['"]/)?.[1]
  );
  expect(url).toContain(expectedUrl);
}
```

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/flows/bangalore-relocation.spec.js

# Run in headed mode (see browser)
npx playwright test --headed

# Run with debugging
npx playwright test --debug

# Generate report
npx playwright show-report
```

## Playwright Config

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5174',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5174,
    reuseExistingServer: true,
  },
});
```

## What to Test

### Critical User Flows
- ✓ Create life event → workflow generation → task approval
- ✓ Task detail page → portal button → correct URL
- ✓ Upload document → URN extraction → task status update
- ✓ Complete task → progress bar updates
- ✓ Filter/search tasks

### Portal Registry Validation
- ✓ Each state shows correct portal names
- ✓ Portal URLs match registry
- ✓ Offline tasks show offline note (no portal button)
- ✓ Prerequisites match registry tags

### Edge Cases
- ✓ Unknown city → "Select your state" flow
- ✓ Gemini extraction failure → manual input fallback
- ✓ Missing portal in registry → error message

## Auto-Application Rules

This skill AUTOMATICALLY applies when:
- Testing UI/UX flows
- Validating portal integrations
- User says "test the flow", "e2e test", "verify UI"
- After making changes to Portal Registry or task rendering logic

**Mandatory behavior:** After any Portal Registry change, ask "Should I run the E2E tests to verify?"
