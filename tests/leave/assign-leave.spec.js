const { test } = require("@playwright/test");
const { leaveAssignPage } = require("../../src/pages/leave.assignLeave.page");

test.describe("Leave - Assign Leave Flow", () => {
  test("@e2e Assign leave (demo-safe)", async ({ page }) => {
    const assign = leaveAssignPage(page);

        const data = {
      employeeQuery: "a",        
      leaveType: null,          
      fromDate: "2026-10-02",
toDate: "2026-10-02",

      comment: "Assigned via Playwright automation"
    };

    await test.step("Open Assign Leave page", async () => {
      await assign.goto();
      await page.screenshot({ path: "test-results/leave/assign-leave-page.png", fullPage: true });
    });

      await test.step("Assign leave", async () => {
      await assign.assignLeave(data);

      const outcome = await assign.waitForOutcome();

      await page.screenshot({
        path: `test-results/leave/assign-leave-outcome-${outcome.type}.png`,
        fullPage: true
      });

      test.info().annotations.push({
        type: "leave-assign-outcome",
        description: `${outcome.type}: ${outcome.message}`
      });


      if (outcome.type === "blocked" || outcome.type === "submitted") return;


      
      if (outcome.type === "fieldError" || outcome.type === "alert") {
        throw new Error(`Assign Leave failed due to UI validation: ${outcome.message}`);
      }

    });

  });
});
