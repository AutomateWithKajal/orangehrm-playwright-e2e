const { test, expect } = require("@playwright/test");
const { pimEmployeeListPage } = require("../../src/pages/pim.employeeList.page");

test.describe("PIM - Employee List", () => {
  test("@smoke Employee List loads", async ({ page }) => {
    const pim = pimEmployeeListPage(page);

    await test.step("Open PIM Employee List", async () => {
      await pim.goto();
    });

    await test.step("Verify results table is present", async () => {
      await pim.expectResultsNotEmpty();
    });
  });

  test("@e2e Search by employee name and open details", async ({ page }) => {
    const pim = pimEmployeeListPage(page);

    const safeScreenshot = async (path) => {
      try {
        if (!page.isClosed()) {
          await page.screenshot({ path, fullPage: true });
        }
      } catch (e) {
        test.info().annotations.push({
          type: "note",
          description: `Screenshot skipped: ${e.message}`
        });
      }
    };

    await test.step("Open PIM Employee List", async () => {
      await pim.goto();
      await safeScreenshot("test-results/pim/employee-list-page.png");
    });

    await test.step("Search by employee name (autocomplete)", async () => {
      await pim.searchByEmployeeName("a");
      await safeScreenshot("test-results/pim/employee-list-after-search.png");
      await pim.expectResultsNotEmpty();
    });

    await test.step("Open first employee details", async () => {
      await pim.openFirstEmployee();
      await safeScreenshot("test-results/pim/employee-details-opened.png");

      const detailsHeader = page.getByRole("heading", {
        name: /personal details|employee/i
      });

      await expect(detailsHeader.first()).toBeVisible({ timeout: 20000 });
    });

    await test.step("Go back and Reset", async () => {
      await page.goBack();
      await pim.reset();
      await safeScreenshot("test-results/pim/employee-list-after-reset.png");
    });
  });
});
