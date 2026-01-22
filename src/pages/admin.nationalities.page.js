const { expect } = require("@playwright/test");

const adminNationalitiesPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const header = page.getByRole("heading", { name: /nationalities/i });

  const addBtn = page.getByRole("button", { name: /\+?\s*add/i });

  const nationalityInput = page
    .locator('form .oxd-input-group:has(label:has-text("Name")) input')
    .first();

  const saveBtn = page.getByRole("button", { name: /^save$/i });
  const cancelBtn = page.getByRole("button", { name: /^cancel$/i });

  const table = page.locator(".oxd-table").first();
  const rows = table.locator(".oxd-table-card");

  const filterNameInput = page
    .locator('form .oxd-input-group:has(label:has-text("Nationality")) input')
    .first();
  const searchBtn = page.getByRole("button", { name: /^search$/i });
  const resetBtn = page.getByRole("button", { name: /^reset$/i });

  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const waitForReady = async () => {
    try {
      await spinner.waitFor({ state: "hidden", timeout: 20000 });
    } catch (e) {}
    try {
      await loader.waitFor({ state: "hidden", timeout: 20000 });
    } catch (e) {}
  };

  const safeClick = async (locator, opts = {}) => {
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: "visible", timeout: 20000 });

    try {
      await locator.click({ timeout: 8000, ...opts });
    } catch (e) {
      await locator.click({ force: true, ...opts });
    }
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 20000 });
    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    await input.type(value, { delay: 15 });
  };

  const goto = async () => {
    await page.goto("/web/index.php/admin/nationality", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForURL(/\/web\/index\.php\/admin\/nationality/, {
      timeout: 45000,
    });

    await header.waitFor({ state: "visible", timeout: 45000 });
    await waitForReady();
  };

  const waitForToast = async (timeout = 20000) => {
    try {
      await toastMsg.first().waitFor({ state: "visible", timeout });
      return (await toastMsg.first().innerText()).trim();
    } catch (e) {
      return null;
    }
  };

  const addNationality = async (name) => {
    await waitForReady();

    await safeClick(addBtn);

    await waitForReady();
    await clearAndType(nationalityInput, name);

    await waitForReady();
    await safeClick(saveBtn);

    await waitForReady();
  };

  const searchNationality = async (name) => {
    await waitForReady();

    const hasFilter = await filterNameInput.count();
    if (hasFilter) {
      await clearAndType(filterNameInput, name);
      await waitForReady();
      await safeClick(searchBtn);
      await waitForReady();
    }
  };

  const resetSearch = async () => {
    await waitForReady();
    if (await resetBtn.count()) {
      await safeClick(resetBtn);
      await waitForReady();
    }
  };

  const findRowByName = async (name) => {
    await waitForReady();
    await expect(header).toBeVisible({ timeout: 20000 });
    await expect(table).toBeVisible({ timeout: 20000 });

    return rows.filter({ hasText: name }).first();
  };

  const deleteByName = async (name) => {
    const row = await findRowByName(name);
    await row.waitFor({ state: "visible", timeout: 20000 });

    const deleteBtn = row.locator('button:has(i.bi-trash)').first();
    await safeClick(deleteBtn);

    const confirm = page.locator(".oxd-dialog-container-default");
    const yesDelete = confirm.getByRole("button", { name: /yes,\s*delete/i });
    await yesDelete.waitFor({ state: "visible", timeout: 20000 });
    await safeClick(yesDelete);

    await waitForReady();
  };

  return {
    goto,
    addNationality,
    searchNationality,
    resetSearch,
    findRowByName,
    deleteByName,
    waitForToast,
  };
};

module.exports = { adminNationalitiesPage };
