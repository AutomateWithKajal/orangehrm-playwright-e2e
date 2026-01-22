const { expect } = require("@playwright/test");

const leaveListPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const leaveLink = page.getByRole("link", { name: /^leave$/i });
  const header = page.getByRole("heading", { name: /leave list/i });

  const leaveStatusDropdown = page
    .locator('form .oxd-input-group:has(label:has-text("Show Leave with Status")) .oxd-select-text')
    .first();

  const statusChips = page.locator("form .oxd-chip");

  const dropdownOptions = page.locator('[role="listbox"] [role="option"]');

  const searchBtn = page.getByRole("button", { name: /^search$/i });
  const resetBtn = page.getByRole("button", { name: /^reset$/i });

  const table = page.locator(".oxd-table").first();

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
    try { await loader.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
  };

  const goto = async () => {
    await page.goto("/web/index.php/leave/viewLeaveList", {
      waitUntil: "domcontentloaded",
    });

    try {
      await page.waitForURL(/\/web\/index\.php\/leave\/viewLeaveList/, { timeout: 20000 });
    } catch (e) {
      await leaveLink.click({ timeout: 10000 });
      await page.waitForURL(/\/web\/index\.php\/leave\//, { timeout: 45000 });
      await page.goto("/web/index.php/leave/viewLeaveList", { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/web\/index\.php\/leave\/viewLeaveList/, { timeout: 45000 });
    }

    await header.waitFor({ state: "visible", timeout: 45000 });
    await waitForReady();
    await expect(searchBtn).toBeVisible({ timeout: 20000 });
  };

  const pickLeaveStatus = async (optionText) => {
    await waitForReady();

    await leaveStatusDropdown.waitFor({ state: "visible", timeout: 20000 });
    await leaveStatusDropdown.scrollIntoViewIfNeeded();

    await leaveStatusDropdown.click();
    await dropdownOptions.first().waitFor({ state: "visible", timeout: 20000 });

    const option = dropdownOptions.filter({ hasText: optionText }).first();

    if ((await option.count()) === 0) {
      await dropdownOptions.first().click();
    } else {
      await option.click();
    }

    await waitForReady();
  };

  const getLeaveStatusText = async () => {
    const chipCount = await statusChips.count();
    if (chipCount > 0) {
      const texts = [];
      for (let i = 0; i < chipCount; i++) {
        texts.push(((await statusChips.nth(i).innerText()) || "").trim());
      }
      return texts.filter(Boolean).join(", ");
    }

    await leaveStatusDropdown.waitFor({ state: "visible", timeout: 20000 });
    return (await leaveStatusDropdown.innerText()).trim();
  };

  const search = async () => {
    await waitForReady();
    await searchBtn.scrollIntoViewIfNeeded();
    await expect(searchBtn).toBeVisible({ timeout: 20000 });

    await searchBtn.click();
    await waitForReady();

    await expect(table).toBeVisible({ timeout: 20000 });
  };

  const reset = async () => {
    await waitForReady();
    await resetBtn.scrollIntoViewIfNeeded();
    await expect(resetBtn).toBeVisible({ timeout: 20000 });

    await resetBtn.click();
    await waitForReady();
  };

  return {
    goto,
    pickLeaveStatus,
    getLeaveStatusText,
    search,
    reset,
  };
};

module.exports = { leaveListPage };
