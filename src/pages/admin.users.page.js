const adminUsersPage = (page) => {
  const header = page.getByRole("heading", { name: /system users/i });

  const form = page.locator("form");

  const usernameInput = form.locator(
    '.oxd-input-group:has(label:has-text("Username")) input'
  );

  const employeeNameInput = form.locator(
    '.oxd-input-group:has(label:has-text("Employee Name")) input'
  );

  const userRoleDropdown = form.locator(
    '.oxd-input-group:has(label:has-text("User Role")) .oxd-select-text'
  );

  const statusDropdown = form.locator(
    '.oxd-input-group:has(label:has-text("Status")) .oxd-select-text'
  );

  const searchBtn = form.getByRole("button", { name: /search/i });
  const resetBtn = form.getByRole("button", { name: /reset/i });

  const resultsTable = page.locator(".oxd-table");

  const goto = async () => {
    await page.goto("/web/index.php/admin/viewSystemUsers");
    await header.waitFor({ state: "visible" });
    await usernameInput.waitFor({ state: "visible" });
  };

  const openDropdownAndPick = async (dropdownLocator, optionText) => {
    await dropdownLocator.scrollIntoViewIfNeeded();
    await dropdownLocator.click();

    const option = page.locator('[role="option"]').filter({
      hasText: new RegExp(optionText, "i")
    });

    await option.first().click();
  };

  const setUsername = async (value) => {
    await usernameInput.scrollIntoViewIfNeeded();
    await usernameInput.fill(value);
  };

  const setEmployeeName = async (value) => {
    await employeeNameInput.scrollIntoViewIfNeeded();
    await employeeNameInput.fill(value);

    const suggestion = page.locator(".oxd-autocomplete-dropdown span").first();
    if (await suggestion.count()) {
      await suggestion.click();
    }
  };

  const setUserRole = async (roleText) => {
    await openDropdownAndPick(userRoleDropdown, roleText);
  };

  const setStatus = async (statusText) => {
    await openDropdownAndPick(statusDropdown, statusText);
  };

  const search = async () => {
    await searchBtn.click();
    await resultsTable.waitFor({ state: "visible" });
    await page.waitForTimeout(300);
  };

  const reset = async () => {
    await resetBtn.click();
    await page.waitForTimeout(300);
  };

  const expectLoaded = async () => {
    await header.waitFor({ state: "visible" });
    await usernameInput.waitFor({ state: "visible" });
  };

  return {
    goto,
    expectLoaded,
    setUsername,
    setEmployeeName,
    setUserRole,
    setStatus,
    search,
    reset
  };
};

module.exports = { adminUsersPage };
