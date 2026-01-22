const { expect } = require("@playwright/test");

const timeTimesheetsPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const timeLink = page.getByRole("link", { name: /^time$/i });

  const timesheetsTopBtn = page.getByRole("button", { name: /timesheets/i }).first();
  const timesheetsTopLink = page.getByRole("link", { name: /timesheets/i }).first();

  const selectEmployeeHeader = page.getByRole("heading", { name: /select employee/i });
  const selectEmployeeCard = selectEmployeeHeader
    .locator("xpath=ancestor::div[contains(@class,'orangehrm-card-container')][1]")
    .first();

  const form = selectEmployeeCard.locator("form");

  const employeeNameInput = form
    .locator('.oxd-input-group:has(label:has-text("Employee Name")) input')
    .first();

  const autoDropdown = page.locator(".oxd-autocomplete-dropdown");
  const autoFirstOption = autoDropdown.locator("span").first();

  const actionBtn = form.getByRole("button", { name: /^(view|search)$/i }).first();
  const resetBtn = form.getByRole("button", { name: /^(reset|clear)$/i }).first();

  const timesheetHeader = page.getByRole("heading", { name: /timesheet for/i }).first();
  const noTimesheetsBanner = page.getByText(/no timesheets found/i).first();

  const resultsTable = page.locator(".oxd-table").first();
  const noRecords = page.getByText(/no records found/i);

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
    try { await loader.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
  };

  const gotoSelectEmployee = async () => {
    await page.goto("/web/index.php/time/viewEmployeeTimesheet", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/web\/index\.php\/time\/viewEmployeeTimesheet/, { timeout: 45000 });

    await expect(selectEmployeeHeader).toBeVisible({ timeout: 45000 });
    await expect(employeeNameInput).toBeVisible({ timeout: 45000 });
    await expect(actionBtn).toBeVisible({ timeout: 45000 });

    await waitForReady();
  };

  const goto = async () => {
    await page.goto("/web/index.php/dashboard/index", { waitUntil: "domcontentloaded" });

    await expect(timeLink).toBeVisible({ timeout: 45000 });
    await timeLink.click();
    await page.waitForURL(/\/web\/index\.php\/time\//, { timeout: 45000 });

    try {
      if (await timesheetsTopBtn.isVisible({ timeout: 2000 })) {
        await timesheetsTopBtn.click();
      } else if (await timesheetsTopLink.isVisible({ timeout: 2000 })) {
        await timesheetsTopLink.click();
      }
    } catch (e) {}

    await gotoSelectEmployee();
  };

  const pickEmployee = async (typeChar = "a") => {
    await waitForReady();

    await employeeNameInput.scrollIntoViewIfNeeded();
    await employeeNameInput.waitFor({ state: "visible", timeout: 20000 });

    await employeeNameInput.click();
    await employeeNameInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await employeeNameInput.press("Backspace");
    await employeeNameInput.type(typeChar, { delay: 30 });

    await autoDropdown.waitFor({ state: "visible", timeout: 20000 });
    await autoFirstOption.waitFor({ state: "visible", timeout: 20000 });
    await autoFirstOption.click();

    await waitForReady();
  };

  const runAction = async () => {
    await waitForReady();

    await actionBtn.scrollIntoViewIfNeeded();
    await expect(actionBtn).toBeVisible({ timeout: 20000 });
    await actionBtn.click();
    await waitForReady();

    
    await Promise.race([
      timesheetHeader.waitFor({ state: "visible", timeout: 20000 }).catch(() => null),
      noTimesheetsBanner.waitFor({ state: "visible", timeout: 20000 }).catch(() => null),
      resultsTable.waitFor({ state: "visible", timeout: 20000 }).catch(() => null),
      noRecords.waitFor({ state: "visible", timeout: 20000 }).catch(() => null),
      page.waitForURL(/\/web\/index\.php\/time\//, { timeout: 20000 }).catch(() => null),
    ]);
  };

  const reset = async () => {
    await waitForReady();

    const inputVisible = await employeeNameInput.isVisible().catch(() => false);
    if (!inputVisible) {
      await gotoSelectEmployee();
    }

    try {
      if (await resetBtn.isVisible({ timeout: 1500 })) {
        await resetBtn.scrollIntoViewIfNeeded();
        await resetBtn.click();
        await waitForReady();
        return;
      }
    } catch (e) {}

    await employeeNameInput.scrollIntoViewIfNeeded();
    await employeeNameInput.click();
    await employeeNameInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await employeeNameInput.press("Backspace");
    await waitForReady();
  };

  const getEmployeeFieldValue = async () => {
    const inputVisible = await employeeNameInput.isVisible().catch(() => false);
    if (!inputVisible) return "";
    return ((await employeeNameInput.inputValue()) || "").trim();
  };

  return {
    goto,
    pickEmployee,
    runAction,
    reset,
    getEmployeeFieldValue,
  };
};

module.exports = { timeTimesheetsPage };
