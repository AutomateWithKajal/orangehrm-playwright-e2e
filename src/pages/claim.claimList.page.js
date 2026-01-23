const { expect } = require("@playwright/test");

const claimListPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const leftMenu = page.locator(".oxd-sidepanel-body").first();
  const claimMenuItem = page.locator("a.oxd-main-menu-item").filter({ hasText: /^claim$/i }).first();

  const moduleHeader = page
    .locator(".oxd-topbar-header-breadcrumb-module")
    .filter({ hasText: /^claim$/i })
    .first();

  const pageHeader = page.getByRole("heading", { name: /claim/i }).first();

  const employeeNameInput = page
    .locator('form .oxd-input-group:has(label:has-text("Employee Name")) input')
    .first();

  const referenceIdInput = page
    .locator('form .oxd-input-group:has(label:has-text("Reference Id")) input')
    .first();

  const searchBtn = page.getByRole("button", { name: /^search$/i }).first();
  const resetBtn = page.getByRole("button", { name: /^reset$/i }).first();

  const resultsContainer = page.locator(".oxd-table, .orangehrm-container").first();
  const rows = page.locator(".oxd-table-card");

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 20000 }); } catch (e) {}
    try { await loader.waitFor({ state: "hidden", timeout: 20000 }); } catch (e) {}
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 20000 });
    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    if (value) await input.type(value, { delay: 10 });
  };

  const gotoDashboard = async () => {
    await page.goto("/web/index.php/dashboard/index", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/web\/index\.php\/dashboard\/index/, { timeout: 45000 });
    await waitForReady();
    await leftMenu.waitFor({ state: "visible", timeout: 45000 });
  };

  const goto = async () => {
    await gotoDashboard();

    try {
      await page.goto("/web/index.php/claim/viewAssignClaim", { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/web\/index\.php\/claim\//, { timeout: 45000 });
      await expect(moduleHeader).toBeVisible({ timeout: 45000 });
      await waitForReady();
      return;
    } catch (e) {
    }

    await claimMenuItem.waitFor({ state: "attached", timeout: 45000 });
    await claimMenuItem.scrollIntoViewIfNeeded().catch(() => {});
    await claimMenuItem.click({ timeout: 8000 });

    await page.waitForURL(/\/web\/index\.php\/claim\//, { timeout: 45000 });
    await Promise.race([
      moduleHeader.waitFor({ state: "visible", timeout: 45000 }).catch(() => {}),
      pageHeader.waitFor({ state: "visible", timeout: 45000 }).catch(() => {}),
    ]);

    await waitForReady();
  };

  const searchByEmployeeName = async (text) => {
    await waitForReady();
    await clearAndType(employeeNameInput, text);

    const dropdown = page.locator(".oxd-autocomplete-dropdown");
    if ((await dropdown.count()) > 0) {
      await dropdown.first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {});
      const firstOpt = dropdown.first().locator("span").first();
      if ((await firstOpt.count()) > 0) {
        await firstOpt.click().catch(() => {});
      }
    }

    await expect(searchBtn).toBeVisible({ timeout: 20000 });
    await searchBtn.click();
    await waitForReady();
  };

  const searchByReferenceId = async (refId) => {
    await waitForReady();
    await clearAndType(referenceIdInput, refId);
    await expect(searchBtn).toBeVisible({ timeout: 20000 });
    await searchBtn.click();
    await waitForReady();
  };

  const reset = async () => {
    await waitForReady();
    if ((await resetBtn.count()) > 0) {
      await resetBtn.click().catch(() => {});
      await waitForReady();
      return;
    }

    if ((await employeeNameInput.count()) > 0) await clearAndType(employeeNameInput, "");
    if ((await referenceIdInput.count()) > 0) await clearAndType(referenceIdInput, "");
    await waitForReady();
  };

  const ensureResultsArea = async () => {
    await waitForReady();
    await resultsContainer.waitFor({ state: "visible", timeout: 30000 });
  };

  const getRowsCount = async () => {
    await waitForReady();
    return await rows.count();
  };

  const assertResetCleared = async () => {
    await waitForReady();
    if ((await employeeNameInput.count()) > 0) await expect(employeeNameInput).toHaveValue("", { timeout: 20000 });
    if ((await referenceIdInput.count()) > 0) await expect(referenceIdInput).toHaveValue("", { timeout: 20000 });
  };

  return {
    goto,
    searchByEmployeeName,
    searchByReferenceId,
    reset,
    ensureResultsArea,
    getRowsCount,
    assertResetCleared,
  };
};

module.exports = { claimListPage };
