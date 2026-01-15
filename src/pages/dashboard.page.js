const dashboardPage = (page) => {
  const header = page.locator("header.oxd-topbar");

  const expectLoaded = async () => {
    await header.waitFor({ state: "visible" });
    await page.waitForURL(/dashboard/i);
  };

  return { expectLoaded };
};

module.exports = { dashboardPage };
