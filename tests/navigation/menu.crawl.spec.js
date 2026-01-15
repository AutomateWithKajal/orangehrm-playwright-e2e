const { test, expect } = require("@playwright/test");
const { sidebar } = require("../../src/components/sidebar.component");

test("@regression Navigation - Crawl all sidebar pages & capture screenshots", async ({ page }) => {
  await page.goto("/web/index.php/dashboard/index");
  await expect(page).toHaveURL(/dashboard/i);

  const sb = sidebar(page);
  const menus = await sb.getVisibleMenuNames();

  for (const name of menus) {
    await test.step(`Open ${name}`, async () => {
      await sb.click(name);
      await page.locator("header.oxd-topbar").waitFor({ state: "visible" });

      await page.screenshot({
        path: `test-results/menu-crawl/${name.replace(/[^a-z0-9]/gi, "_")}.png`,
        fullPage: true
      });
    });
  }
});
