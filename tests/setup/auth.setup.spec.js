require("dotenv").config();
const { test, expect } = require("@playwright/test");

test("Auth Setup - Create storageState", async ({ page }) => {
  await page.goto("/web/index.php/auth/login", { waitUntil: "domcontentloaded" });

  const username = page.locator('input[name="username"]');
  const password = page.locator('input[name="password"]');
  const submit = page.locator('button[type="submit"]');

  await expect(username).toBeVisible();
  await username.fill(process.env.USERNAME);
  await password.fill(process.env.PASSWORD);

  await Promise.all([
    page.waitForResponse((res) => res.url().includes("/web/index.php/auth/validate") && res.status() < 500, { timeout: 30000 })
      .catch(() => null),
    submit.click()
  ]);

  const invalidToastOrError = page.locator(".oxd-alert-content-text");

  const dashboardSignal = page.locator("header.oxd-topbar");
  const outcome = await Promise.race([
    dashboardSignal.waitFor({ state: "visible", timeout: 30000 }).then(() => "DASHBOARD").catch(() => null),
    invalidToastOrError.waitFor({ state: "visible", timeout: 8000 }).then(() => "ERROR").catch(() => null),
    page.waitForURL(/dashboard/i, { timeout: 30000 }).then(() => "DASHBOARD").catch(() => null)
  ]);

  if (outcome !== "DASHBOARD") {
    await page.screenshot({ path: "test-results/setup-login-failed.png", fullPage: true });

    const errText = (await invalidToastOrError.count())
      ? (await invalidToastOrError.first().innerText().catch(() => ""))
      : "";

    throw new Error(
      `Login did not reach dashboard. Current URL: ${page.url()}${errText ? ` | UI error: ${errText}` : ""}`
    );
  }

  await expect(page).toHaveURL(/dashboard/i);

  await page.context().storageState({ path: "storageState.json" });
});
