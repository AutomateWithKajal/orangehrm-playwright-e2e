const table = (page) => {
  const root = page.locator(".oxd-table");
  const rows = page.locator(".oxd-table-body .oxd-table-card");
  const paginationNext = page.locator("button.oxd-pagination-page-item--previous-next").nth(1);
  const paginationPrev = page.locator("button.oxd-pagination-page-item--previous-next").nth(0); 
  const waitForLoaded = async () => {
    await root.waitFor({ state: "visible" });
    await page.waitForTimeout(300); 
  };

  const getRowCount = async () => {
    await waitForLoaded();
    return await rows.count();
  };

  const getRowTexts = async () => {
    await waitForLoaded();
    const count = await rows.count();
    const out = [];
    for (let i = 0; i < count; i++) out.push((await rows.nth(i).innerText()).trim());
    return out;
  };

  const nextPage = async () => {
    await paginationNext.click();
    await waitForLoaded();
  };

  const prevPage = async () => {
    await paginationPrev.click();
    await waitForLoaded();
  };

  return { waitForLoaded, getRowCount, getRowTexts, nextPage, prevPage };
};

module.exports = { table };
