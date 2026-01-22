const { test, expect } = require("@playwright/test");
const { timeTimesheetsPage } = require("../../src/pages/time.timesheets.page");

test.describe("Time - Timesheets", () => {
  test("@e2e Timesheets action + reset (demo-safe)", async ({ page }) => {
    const ts = timeTimesheetsPage(page);

    await test.step("Open Time/Timesheets page", async () => {
      await ts.goto();
      await page.screenshot({
        path: "test-results/time-timesheets-page.png",
        fullPage: true,
      });
    });

    await test.step("Pick employee + Run action (Search/View)", async () => {
      await ts.pickEmployee("a");

      const before = await ts.getEmployeeFieldValue();
      expect(before.length).toBeGreaterThan(0);

      await ts.runAction();

      await page.screenshot({
        path: "test-results/time-timesheets-action.png",
        fullPage: true,
      });
    });

    await test.step("Reset (button or fallback clear) and verify cleared", async () => {
      await ts.reset();

      const after = await ts.getEmployeeFieldValue();
      expect(after).toBe("");

      await page.screenshot({
        path: "test-results/time-timesheets-reset.png",
        fullPage: true,
      });
    });
  });
});
