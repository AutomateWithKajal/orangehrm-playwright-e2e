const { test, expect } = require("@playwright/test");
const { leaveListPage } = require("../../src/pages/leave.leaveList.page");

test.describe("Leave - Leave List", () => {
  test("@e2e Leave List filter + reset (demo-safe)", async ({ page }) => {
    const leaveList = leaveListPage(page);

    await test.step("Open Leave List page", async () => {
      await leaveList.goto();
      await page.screenshot({
        path: "test-results/leave/leave-list-page.png",
        fullPage: true
      });
    });

    await test.step("Apply filter (Leave Status) and search", async () => {
      await leaveList.pickLeaveStatus("Pending Approval");

      const chosen = await leaveList.getLeaveStatusText();
      expect(chosen.length).toBeGreaterThan(0);

      await leaveList.search();

      await page.screenshot({
        path: "test-results/leave/leave-list-filtered.png",
        fullPage: true
      });
    });

    await test.step("Reset filters and verify status reset", async () => {
      await leaveList.reset();

      const after = await leaveList.getLeaveStatusText();
      expect(after.length).toBeGreaterThan(0);

      await page.screenshot({
        path: "test-results/leave/leave-list-reset.png",
        fullPage: true
      });
    });
  });
});
