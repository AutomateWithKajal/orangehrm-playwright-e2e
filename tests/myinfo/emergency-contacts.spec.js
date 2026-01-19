const { test, expect } = require("@playwright/test");
const { myInfoEmergencyContactsPage } = require("../../src/pages/myinfo.emergencyContacts.page");

test.describe("My Info - Emergency Contacts", () => {
  test("@e2e Add and delete emergency contact (CRUD demo)", async ({ page }) => {
    const emergency = myInfoEmergencyContactsPage(page);

    const stamp = Date.now().toString().slice(-5);
    const data = {
      name: `Auto EC ${stamp}`,
      relationship: "Friend",
      homeTelephone: `1000${stamp}`,
      mobile: `9000${stamp}`
    };

    const safeScreenshot = async (path) => {
      try {
        if (!page.isClosed()) {
          await page.screenshot({ path, fullPage: true });
        }
      } catch (e) {
        test.info().annotations.push({
          type: "note",
          description: `Screenshot skipped/failed (page closing): ${e.message}`
        });
      }
    };

    await test.step("Open Emergency Contacts page", async () => {
      await emergency.goto();
      await safeScreenshot("test-results/myinfo/emergency-contacts-page.png");
    });

    await test.step("Add emergency contact", async () => {
      await emergency.addContact(data);

      const toast = await emergency.waitForToast(8000); 
      test.info().annotations.push({ type: "toast", description: toast || "null" });

      await safeScreenshot("test-results/myinfo/emergency-contacts-added.png");

      if (toast) {
        expect(toast.toLowerCase()).toMatch(/success|successfully|saved/);
      }
    });

    await test.step("Verify contact exists in table", async () => {
      const row = await emergency.findRowByName(data.name);
      await expect(row).toBeVisible({ timeout: 20000 });
    });

    await test.step("Delete contact and verify removal", async () => {
      await emergency.deleteByName(data.name);

      const rowAfterDelete = await emergency.findRowByName(data.name);
      await expect(rowAfterDelete).toHaveCount(0, { timeout: 20000 });

      const toast = await emergency.waitForToast(1500);
      test.info().annotations.push({ type: "toast", description: toast || "null" });

      await safeScreenshot("test-results/myinfo/emergency-contacts-deleted.png");
    });
  });
});
