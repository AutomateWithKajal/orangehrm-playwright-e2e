const pimEmployeeListPage = (page) => {
  const header = page.getByRole("heading", { name: /employee information/i });

  const form = page.locator("form");

  const employeeNameInput = form.locator(
    '.oxd-input-group:has(label:has-text("Employee Name")) input'
  );

  const searchBtn = form.getByRole("button", { name: /search/i });
  const resetBtn = form.getByRole("button", { name: /reset/i });

  const tableBody = page.locator(".oxd-table-body");

  const goto = async () => {
    await page.goto("/web/index.php/pim/viewEmployeeList");
    await header.waitFor({ state: "visible" });
  };

  const searchByEmployeeName = async (name) => {
    await employeeNameInput.fill(name);

    const suggestion = page.locator(".oxd-autocomplete-dropdown span").first();
    if (await suggestion.count()) {
      await suggestion.click();
    }

    await searchBtn.click();
    await tableBody.waitFor({ state: "visible" });
  };

  const expectEmployeeInResults = async (name) => {
    const row = tableBody.getByText(name, { exact: false });
    await row.waitFor({ state: "visible" });
  };

  const reset = async () => {
    await resetBtn.click();
  };

  return {
    goto,
    searchByEmployeeName,
    expectEmployeeInResults,
    reset
  };
};

module.exports = { pimEmployeeListPage };
