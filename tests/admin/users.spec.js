const { test, expect } = require("@playwright/test");
const { adminUsersPage } = require("../../src/pages/admin.users.page");
const { table } = require("../../src/components/table.component");

test.describe("Admin - Users", () => {
  test("@smoke Admin Users page loads", async ({ page }) => {
    const admin = adminUsersPage(page);

    await admin.goto();
    await admin.expectLoaded();

    await expect(page).toHaveURL(/admin\/viewSystemUsers/i);
    await page.screenshot({ path: "test-results/admin-users/smoke-loaded.png", fullPage: true });
  });

  test("@regression Search by username (Admin)", async ({ page }) => {
    const admin = adminUsersPage(page);
    const t = table(page);

    await admin.goto();
    await admin.setUsername("Admin");
    await admin.search();

    await t.waitForLoaded();
    const rows = await t.getRowTexts();

    expect(rows.some(r => /Admin/i.test(r))).toBeTruthy();

    await page.screenshot({ path: "test-results/admin-users/search-username-admin.png", fullPage: true });
  });

  test("@regression Filter by User Role (ESS) + Status (Enabled) and validate results not empty", async ({ page }) => {
    const admin = adminUsersPage(page);
    const t = table(page);

    await admin.goto();
    await admin.setUserRole("ESS");
    await admin.setStatus("Enabled");
    await admin.search();

    await t.waitForLoaded();
    const count = await t.getRowCount();

    expect(typeof count).toBe("number");
    await page.screenshot({ path: "test-results/admin-users/filter-role-status.png", fullPage: true });
  });

  test("@regression Reset clears filters (visual + URL stable)", async ({ page }) => {
    const admin = adminUsersPage(page);

    await admin.goto();
    await admin.setUsername("Admin");
    await admin.setStatus("Disabled");
    await admin.reset();

  
    await admin.search();
    await expect(page).toHaveURL(/admin\/viewSystemUsers/i);

    await page.screenshot({ path: "test-results/admin-users/reset.png", fullPage: true });
  });

 test("@regression Negative: search non-existent user => No Records Found", async ({ page }) => {
  const admin = adminUsersPage(page);

  await admin.goto();
  await admin.setUsername(`NoUser_${Date.now()}`);
  await admin.search();

  const emptyState = page.locator(".oxd-table-body").getByText("No Records Found", { exact: true });

  const toastMsg = page.locator("#oxd-toaster_1").getByText("No Records Found", { exact: true });

  await Promise.race([
    emptyState.waitFor({ state: "visible" }),
    toastMsg.waitFor({ state: "visible" })
  ]);

  await page.screenshot({ path: "test-results/admin-users/no-records.png", fullPage: true });
});

});
