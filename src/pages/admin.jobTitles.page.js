const { expect } = require("@playwright/test");

const adminJobTitlesPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const header = page.getByRole("heading", { name: /job titles/i });

  const addBtn = page.getByRole("button", { name: /\+?\s*add/i });

  const jobTitleInput = page
    .locator('form .oxd-input-group:has(label:has-text("Job Title")) input')
    .first();

  const saveBtn = page.getByRole("button", { name: /^save$/i });

  const searchTitleInput = page
    .locator('form .oxd-input-group:has(label:has-text("Job Title")) input')
    .first();

  const searchBtn = page.getByRole("button", { name: /^search$/i });
  const resetBtn = page.getByRole("button", { name: /^reset$/i });

  const table = page.locator(".oxd-table").filter({ hasText: /job title/i }).first();
  const rows = table.locator(".oxd-table-card");

  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
    try { await loader.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
  };

  const waitForToast = async (timeout = 20000) => {
    try {
      await toastMsg.first().waitFor({ state: "visible", timeout });
      return (await toastMsg.first().innerText()).trim();
    } catch (e) {
      return null; 
    }
  };

  const goto = async () => {
    await page.goto("/web/index.php/admin/viewJobTitleList", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/web\/index\.php\/admin\/viewJobTitleList/, { timeout: 45000 });

    await header.waitFor({ state: "visible", timeout: 45000 });
    await waitForReady();
  };

  const openAdd = async () => {
    await waitForReady();
    await addBtn.waitFor({ state: "visible", timeout: 20000 });
    await addBtn.scrollIntoViewIfNeeded();

    try {
      await addBtn.click({ timeout: 7000 });
    } catch (e) {
      await addBtn.click({ force: true });
    }

    await waitForReady();
    await jobTitleInput.waitFor({ state: "visible", timeout: 20000 });
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

  const addJobTitle = async (name) => {
    await openAdd();
    await clearAndType(jobTitleInput, name);

    await waitForReady();
    await saveBtn.click();
    await waitForReady();
  };

  const reset = async () => {
    await waitForReady();

    if (await resetBtn.count()) {
      try {
        await resetBtn.scrollIntoViewIfNeeded();
        await resetBtn.click({ timeout: 7000 });
      } catch (e) {
        await resetBtn.click({ force: true });
      }
      await waitForReady();
      return;
    }

    if (await searchTitleInput.count()) {
      await clearAndType(searchTitleInput, "");
    }
  };

  const searchByName = async (name) => {
    await waitForReady();

    if (await searchTitleInput.count()) {
      await clearAndType(searchTitleInput, name);
    }

    if (await searchBtn.count()) {
      try {
        await searchBtn.scrollIntoViewIfNeeded();
        await searchBtn.click({ timeout: 7000 });
      } catch (e) {
        await searchBtn.click({ force: true });
      }
      await waitForReady();
    }
  };

  const findRowByName = async (name) => {
    await waitForReady();

    try {
      await expect(table).toBeVisible({ timeout: 20000 });
    } catch (e) {
    }

    return rows.filter({ hasText: name });
  };

  const deleteByName = async (name) => {
    await waitForReady();

    const target = (await findRowByName(name)).first();
    await expect(target).toBeVisible({ timeout: 20000 });

    const trashBtn = target.locator('button:has(i.bi-trash), button i.bi-trash').first();

    try {
      await trashBtn.scrollIntoViewIfNeeded();
      await trashBtn.click({ timeout: 7000 });
    } catch (e) {
      await trashBtn.click({ force: true });
    }

    const confirm = page.locator(".oxd-dialog-container-default");
    const yesDelete = confirm.getByRole("button", { name: /yes,\s*delete/i });

    await yesDelete.waitFor({ state: "visible", timeout: 20000 });
    await yesDelete.click();

    await waitForReady();
  };

  return {
    goto,
    addJobTitle,
    reset,
    searchByName,
    findRowByName,
    deleteByName,
    waitForToast
  };
};

module.exports = { adminJobTitlesPage };
