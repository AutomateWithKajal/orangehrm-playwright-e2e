const { expect } = require("@playwright/test");

const recruitmentCandidatesPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const recruitmentLink = page.getByRole("link", { name: /^recruitment$/i });

  const header = page.getByRole("heading", { name: /candidates/i });

  const candidateNameInput = page
    .locator('form .oxd-input-group:has(label:has-text("Candidate Name")) input')
    .first();

  const searchBtn = page.getByRole("button", { name: /^search$/i });
  const resetBtn = page.getByRole("button", { name: /^reset$/i });

  const table = page.locator(".oxd-table").first();
  const rows = table.locator(".oxd-table-card, .oxd-table-row").first(); 

  const waitForReady = async () => {
    try {
      await spinner.waitFor({ state: "hidden", timeout: 15000 });
    } catch (e) {}
    try {
      await loader.waitFor({ state: "hidden", timeout: 15000 });
    } catch (e) {}
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 20000 });

    await input.click({ timeout: 10000 });
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    await input.type(value, { delay: 20 });
  };

  const goto = async () => {
    await page.goto("/web/index.php/recruitment/viewCandidates", {
      waitUntil: "domcontentloaded"
    });

    try {
      await page.waitForURL(/\/web\/index\.php\/recruitment\/viewCandidates/, {
        timeout: 20000
      });
    } catch (e) {
      await recruitmentLink.click({ timeout: 10000 });
      await page.waitForURL(/\/web\/index\.php\/recruitment\//, { timeout: 45000 });

      await page.goto("/web/index.php/recruitment/viewCandidates", {
        waitUntil: "domcontentloaded"
      });
      await page.waitForURL(/\/web\/index\.php\/recruitment\/viewCandidates/, {
        timeout: 45000
      });
    }

    await header.waitFor({ state: "visible", timeout: 45000 });
    await waitForReady();
  };

  const setCandidateName = async (text) => {
    await clearAndType(candidateNameInput, text);
    await waitForReady();
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

  const expectResultsLoaded = async () => {
    await waitForReady();
    await expect(table).toBeVisible({ timeout: 20000 });

    await header.waitFor({ state: "visible", timeout: 20000 });
  };

  const getCandidateNameValue = async () => {
    await candidateNameInput.waitFor({ state: "visible", timeout: 20000 });
    return (await candidateNameInput.inputValue()).trim();
  };

  return {
    goto,
    setCandidateName,
    search,
    reset,
    expectResultsLoaded,
    getCandidateNameValue
  };
};

module.exports = { recruitmentCandidatesPage };
