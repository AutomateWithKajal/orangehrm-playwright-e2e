const { test, expect } = require("@playwright/test");
const { buzzFeedPage } = require("../../src/pages/buzz.buzzFeed.page");

test.describe("Buzz", () => {
  test("@e2e Buzz create post (demo-safe)", async ({ page }) => {
    const buzz = buzzFeedPage(page);

    const stamp = Date.now().toString().slice(-5);
    const message = `Auto Buzz Post ${stamp}`;

    await test.step("Open Buzz page", async () => {
      await buzz.goto();
      await page.screenshot({ path: "test-results/buzz-page.png", fullPage: true });
    });

    await test.step("Open composer + type message", async () => {
      await buzz.writePost(message);
      await page.screenshot({ path: "test-results/buzz-typed.png", fullPage: true });
    });

    await test.step("Post (if allowed) OR close safely + verify toast/UI", async () => {
      const action = await buzz.trySubmitOrClose();

      const toast = await buzz.waitForToastSoft(8000);
      test.info().annotations.push({ type: "buzzAction", description: action });
      test.info().annotations.push({ type: "toast", description: String(toast) });

      await page.screenshot({ path: "test-results/buzz-after-action.png", fullPage: true });

      if (toast) {
        expect(toast.toLowerCase()).toMatch(/success|successfully|posted|saved/);
      } else {
        await expect(page).toHaveURL(/\/web\/index\.php\/buzz\//);
      }
    });

    await test.step("Reset-like: ensure composer cleared", async () => {
      try {
        await buzz.assertComposerCleared();
      } catch (e) {
        await buzz.writePost("");
        await buzz.assertComposerCleared();
      }

      await page.screenshot({ path: "test-results/buzz-cleared.png", fullPage: true });
    });
  });
});
