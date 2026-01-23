const { expect } = require("@playwright/test");

const buzzFeedPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const leftMenu = page.locator(".oxd-sidepanel-body").first();
  const buzzMenuItem = page.locator("a.oxd-main-menu-item").filter({ hasText: /buzz/i }).first();

  const moduleHeader = page
    .locator(".oxd-topbar-header-breadcrumb-module")
    .filter({ hasText: /buzz/i })
    .first();

  const postTextArea = page.locator("textarea").first();

  const postBtn = page.getByRole("button", { name: /^post$/i }).first();
  const cancelBtn = page.getByRole("button", { name: /^cancel$/i }).first();

  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 20000 }); } catch (e) {}
    try { await loader.waitFor({ state: "hidden", timeout: 20000 }); } catch (e) {}
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 20000 });
    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    if (value) await input.type(value, { delay: 10 });
  };

  const gotoDashboard = async () => {
    await page.goto("/web/index.php/dashboard/index", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/web\/index\.php\/dashboard\/index/, { timeout: 45000 });
    await waitForReady();

    await leftMenu.waitFor({ state: "visible", timeout: 45000 });
  };

  const goto = async () => {
    await gotoDashboard();

    try {
      await page.goto("/web/index.php/buzz/viewBuzz", { waitUntil: "domcontentloaded" });
      await page.waitForURL(/\/web\/index\.php\/buzz\//, { timeout: 45000 });
      await expect(moduleHeader).toBeVisible({ timeout: 45000 });
      await waitForReady();
      return;
    } catch (e) {
    }

    await buzzMenuItem.waitFor({ state: "attached", timeout: 45000 });

    try {
      await buzzMenuItem.scrollIntoViewIfNeeded();
    } catch (e) {
    }

    await buzzMenuItem.click({ timeout: 8000 });
    await page.waitForURL(/\/web\/index\.php\/buzz\//, { timeout: 45000 });
    await expect(moduleHeader).toBeVisible({ timeout: 45000 });
    await waitForReady();
  };

  const openComposer = async () => {
    await waitForReady();
    await expect(postTextArea).toBeVisible({ timeout: 30000 });
    await postTextArea.scrollIntoViewIfNeeded();
    await postTextArea.click();
    await waitForReady();
  };

  const writePost = async (message) => {
    await openComposer();
    await clearAndType(postTextArea, message);
  };

  const trySubmitOrClose = async () => {
    await waitForReady();

    const canPost = (await postBtn.count()) > 0 && (await postBtn.isVisible().catch(() => false));
    if (canPost) {
      try {
        await postBtn.click({ timeout: 8000 });
        await waitForReady();
        return "posted";
      } catch (e) {
        // 
      }
    }

    const canCancel = (await cancelBtn.count()) > 0 && (await cancelBtn.isVisible().catch(() => false));
    if (canCancel) {
      await cancelBtn.click().catch(() => {});
      await waitForReady();
      return "cancelled";
    }

    await clearAndType(postTextArea, "");
    await waitForReady();
    return "cleared";
  };

  const waitForToastSoft = async (timeout = 7000) => {
    try {
      await toastMsg.first().waitFor({ state: "visible", timeout });
      return (await toastMsg.first().innerText()).trim();
    } catch (e) {
      return null;
    }
  };

  const assertComposerCleared = async () => {
    await expect(postTextArea).toBeVisible({ timeout: 20000 });
    await expect(postTextArea).toHaveValue("", { timeout: 20000 });
  };

  return {
    goto,
    writePost,
    trySubmitOrClose,
    waitForToastSoft,
    assertComposerCleared,
  };
};

module.exports = { buzzFeedPage };
