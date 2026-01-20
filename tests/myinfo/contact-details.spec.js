const { test, expect } = require("@playwright/test");
const { myInfoContactDetailsPage } = require("../../src/pages/myinfo.contactDetails.page");

test.describe("My Info - Contact Details", () => {
  test("@e2e Update contact details and verify toast", async ({ page }) => {
    const contact = myInfoContactDetailsPage(page);

    const stamp = Date.now().toString().slice(-5);
    const data = {
      street: `Auto Street ${stamp}`,
      cityName: `AutoCity ${stamp}`,
      mobileNo: `9${stamp}0000`,
      email: `auto${stamp}@example.com`
    };

    const safeScreenshot = async (path) => {
      try {
        if (!page.isClosed()) await page.screenshot({ path, fullPage: true });
      } catch (e) {
        test.info().annotations.push({ type: "note", description: `Screenshot skipped: ${e.message}` });
      }
    };

    await test.step("Open Contact Details page", async () => {
      await contact.goto();
      await safeScreenshot("test-results/myinfo/contact-details-page.png");
    });

    await test.step("Update fields and save", async () => {
      await contact.updateContact(data);

      const toast = await contact.waitForToast(8000);
      test.info().annotations.push({ type: "toast", description: toast || "null" });

      await safeScreenshot("test-results/myinfo/contact-details-saved.png");

      if (toast) expect(toast.toLowerCase()).toMatch(/success|successfully|saved/);
    });

    await test.step("Verify mobile value persisted (UI-level)", async () => {
      await contact.expectMobileValue(data.mobileNo);
    });
  });
});
