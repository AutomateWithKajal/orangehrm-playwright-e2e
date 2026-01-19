const { test, expect } = require("@playwright/test");
const { myInfoPersonalDetailsPage } = require("../../src/pages/myinfo.personalDetails.page");

test.describe("My Info - Personal Details", () => {
  test("@e2e Update personal details name fields and verify save toast", async ({ page }) => {
    const myInfo = myInfoPersonalDetailsPage(page);

    const stamp = Date.now().toString().slice(-4); 
    const data = {
      firstName: `Jane${stamp}`,
      middleName: `Auto${stamp}`,
      lastName: `Smith${stamp}`
    };

    await test.step("Open My Info Personal Details", async () => {
      await myInfo.goto();
      await page.screenshot({
        path: "test-results/myinfo/personal-details-page.png",
        fullPage: true
      });
    });

    await test.step("Update name and save", async () => {
      await myInfo.updateName(data);

      const toast = await myInfo.waitForToast();
      test.info().annotations.push({
        type: "toast",
        description: toast
      });

      await page.screenshot({
        path: "test-results/myinfo/personal-details-saved.png",
        fullPage: true
      });

      expect(toast.toLowerCase()).toMatch(/success|successfully|saved/);
    });
  });
});
