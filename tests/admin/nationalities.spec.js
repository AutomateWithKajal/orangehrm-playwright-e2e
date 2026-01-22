const { test, expect } = require("@playwright/test");
const { adminNationalitiesPage } = require("../../src/pages/admin.nationalities.page");

test.describe("Admin - Nationalities", () => {
  test("@e2e Add, search and delete nationality (CRUD demo)", async ({ page }) => {
    const nat = adminNationalitiesPage(page);

    const stamp = Date.now().toString().slice(-5);
    const name = `Auto Nat ${stamp}`;

    await test.step("Open Nationalities page", async () => {
      await nat.goto();
      await page.screenshot({
        path: "test-results/admin/nationalities-page.png",
        fullPage: true
      });
    });

    await test.step("Add nationality", async () => {
      await nat.addNationality(name);

      const toast = await nat.waitForToast();
      test.info().annotations.push({ type: "toast", description: toast });

      await page.screenshot({
        path: "test-results/admin/nationalities-added.png",
        fullPage: true
      });

      if (toast) expect(toast.toLowerCase()).toMatch(/success|successfully|saved/);
    });

    await test.step("Search and verify in results", async () => {
      await nat.resetSearch();
      await nat.searchNationality(name);

      const row = await nat.findRowByName(name);
      await expect(row).toBeVisible({ timeout: 20000 });

      await page.screenshot({
        path: "test-results/admin/nationalities-searched.png",
        fullPage: true
      });
    });

    await test.step("Delete nationality and verify removal", async () => {
      await nat.deleteByName(name);

      const toast = await nat.waitForToast();
      test.info().annotations.push({ type: "toast", description: toast });

      await page.screenshot({
        path: "test-results/admin/nationalities-deleted.png",
        fullPage: true
      });

      await nat.resetSearch();
      await nat.searchNationality(name);

      const row = await nat.findRowByName(name);
      await expect(row).toHaveCount(0);
    });
  });
});
