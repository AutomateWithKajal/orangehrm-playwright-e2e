const { expect } = require("@playwright/test");

const pimEmployeeListPage = (page) => {
  const header = page.getByRole("heading", { name: /employee information/i });
  const form = page.locator("form");

  const employeeNameInput = form.locator(
    '.oxd-input-group:has(label:has-text("Employee Name")) input'
  );

  const searchBtn = form.getByRole("button", { name: /search/i });
  const resetBtn = form.getByRole("button", { name: /reset/i });

  const tableBody = page.locator(".oxd-table-body");

  const spinner = page.locator(".oxd-loading-spinner");
  const loader = page.locator(".oxd-form-loader");
  const rows = tableBody.locator(".oxd-table-card");

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 15000 }); } catch {}
    try { await loader.waitFor({ state: "hidden", timeout: 15000 }); } catch {}
  };

  const pickFirstAutocomplete = async () => {
    const dropdown = page.locator(".oxd-autocomplete-dropdown");
    if (await dropdown.isVisible({ timeout: 3000 }).catch(() => false)) {
      const first = dropdown.locator("span").first();
      if (await first.count()) {
        await first.click();
      }
    }
  };

  const goto = async () => {
    await page.goto("/web/index.php/pim/viewEmployeeList", {
      waitUntil: "domcontentloaded"
    });
    await header.waitFor({ state: "visible", timeout: 30000 });
    await waitForReady();
  };

  const searchByEmployeeName = async (name) => {
    await waitForReady();
    await employeeNameInput.click();
    await employeeNameInput.fill(name);

    await pickFirstAutocomplete();

    await searchBtn.click();
    await waitForReady();
    await tableBody.waitFor({ state: "visible", timeout: 20000 });
  };

  const expectEmployeeInResults = async (name) => {
    const row = tableBody.getByText(name, { exact: false });
    await row.waitFor({ state: "visible", timeout: 20000 });
  };

  const reset = async () => {
    await waitForReady();
    await resetBtn.click();
    await waitForReady();
  };


  const expectResultsNotEmpty = async () => {
    await expect(tableBody).toBeVisible({ timeout: 20000 });
    await expect(rows.first()).toBeVisible({ timeout: 20000 });
  };

  const openFirstEmployee = async () => {
    await expectResultsNotEmpty();

    const firstRow = rows.first();
    await firstRow.click();

    await page.waitForURL(
      /\/web\/index\.php\/pim\/view(PersonalDetails|Employee)/,
      { timeout: 30000 }
    );
  };

  return {
    goto,
    searchByEmployeeName,
    expectEmployeeInResults,
    reset,

    expectResultsNotEmpty,
    openFirstEmployee
  };
};

module.exports = { pimEmployeeListPage };
