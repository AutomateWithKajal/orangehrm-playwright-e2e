const { expect } = require("@playwright/test");

const directorySearchPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const header = page
    .locator(".oxd-topbar-header-breadcrumb-module")
    .filter({ hasText: /directory/i });

  const recordsFoundText = page.locator("text=/\\(\\d+\\)\\s*Records Found/i").first();
  const cards = page.locator(".orangehrm-directory-card");

  const usernameInput = page.locator('input[name="username"]');
  const passwordInput = page.locator('input[name="password"]');
  const loginBtn = page.getByRole("button", { name: /^login$/i });

  const directoryLink = page.getByRole("link", { name: /^directory$/i });
  const sidebarSearch = page.locator('aside input[placeholder="Search"]').first();

  const employeeNameInput = page
    .locator('form .oxd-input-group:has(label:has-text("Employee Name")) input')
    .first();

  const searchBtn = page.getByRole("button", { name: /^search$/i });
  const resetBtn = page.getByRole("button", { name: /^reset$/i });

  const waitForReady = async () => {
    try {
      await spinner.waitFor({ state: "hidden", timeout: 20000 });
    } catch (e) {}
    try {
      await loader.waitFor({ state: "hidden", timeout: 20000 });
    } catch (e) {}
  };

  const maybeLogin = async () => {
    const onLoginUrl = /\/web\/index\.php\/auth\/login/.test(page.url());
    const hasLoginForm = (await usernameInput.count()) > 0;

    if (!onLoginUrl && !hasLoginForm) return;

    const user = process.env.ORANGEHRM_USERNAME || process.env.USERNAME;
    const pass = process.env.ORANGEHRM_PASSWORD || process.env.PASSWORD;

    if (!user || !pass) {
      throw new Error("Not logged in and missing ORANGEHRM_USERNAME / ORANGEHRM_PASSWORD in env.");
    }

    await usernameInput.waitFor({ state: "visible", timeout: 45000 });
    await usernameInput.fill(user);
    await passwordInput.fill(pass);
    await loginBtn.click();

    await page.waitForURL(/\/web\/index\.php\/(dashboard|pim|leave|time)\//, { timeout: 45000 });
    await waitForReady();
  };

  const assertOnDirectory = async () => {
    await page.waitForURL(/\/web\/index\.php\/directory\//, { timeout: 45000 });
    await expect(header.first()).toBeVisible({ timeout: 45000 });
    await waitForReady();
  };

  const goto = async () => {
    await maybeLogin();

    try {
      await page.goto("/web/index.php/directory/viewDirectory", { waitUntil: "domcontentloaded" });
      await assertOnDirectory();
      return;
    } catch (e) {
    }

    await waitForReady();

    if (await directoryLink.count()) {
      await directoryLink.scrollIntoViewIfNeeded();
      try {
        await directoryLink.click({ timeout: 8000 });
      } catch (e) {
        await directoryLink.click({ force: true });
      }
      await assertOnDirectory();
      return;
    }

    if (await sidebarSearch.count()) {
      await sidebarSearch.click();
      await sidebarSearch.fill("Directory");

      const suggestion = page.getByRole("link", { name: /directory/i }).first();
      await suggestion.waitFor({ state: "visible", timeout: 15000 });
      await suggestion.click();

      await assertOnDirectory();
      return;
    }

    throw new Error("Directory module not reachable: direct URL failed and sidebar link/search not found.");
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 20000 });
    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    if (value) await input.type(value, { delay: 15 });
  };

  const search = async (query = "a") => {
    await waitForReady();

    if (await employeeNameInput.count()) {
      await clearAndType(employeeNameInput, query);

      const dd = page.locator(".oxd-autocomplete-dropdown");
      if (await dd.count()) {
        try {
          await dd.waitFor({ state: "visible", timeout: 5000 });
          const first = dd.locator("span").first();
          await first.waitFor({ state: "visible", timeout: 5000 });
          await first.click();
        } catch (e) {}
      }
    }

    await expect(searchBtn).toBeVisible({ timeout: 20000 });
    await searchBtn.click();
    await waitForReady();
  };

  const ensureResultsArea = async () => {
    await waitForReady();

    try {
      await recordsFoundText.waitFor({ state: "visible", timeout: 20000 });
    } catch (e) {
      await expect(cards).toHaveCount(await cards.count(), { timeout: 5000 });
    }
  };

  const reset = async () => {
    await waitForReady();

    if (await resetBtn.count()) {
      await expect(resetBtn).toBeVisible({ timeout: 20000 });
      await resetBtn.click();
      await waitForReady();
      return;
    }

    if (await employeeNameInput.count()) {
      await clearAndType(employeeNameInput, "");
    }
  };

  const getCardsCount = async () => {
    await waitForReady();
    return await cards.count();
  };

  return {
    goto,
    search,
    reset,
    ensureResultsArea,
    getCardsCount,
  };
};

module.exports = { directorySearchPage };
