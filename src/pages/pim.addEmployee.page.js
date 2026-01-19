const pimAddEmployeePage = (page) => {
  const header = page.getByRole("heading", { name: /add employee/i });

  const firstNameInput = page.locator('input[name="firstName"]');
  const middleNameInput = page.locator('input[name="middleName"]');
  const lastNameInput = page.locator('input[name="lastName"]');

  const saveBtn = page.getByRole("button", { name: /save/i });

  const personalDetailsHeader = page.getByRole("heading", {
    name: /personal details/i
  });

  const goto = async () => {
    await page.goto("/web/index.php/pim/addEmployee");
    await header.waitFor({ state: "visible" });
  };

  const addEmployee = async ({ firstName, middleName, lastName }) => {
    await firstNameInput.fill(firstName);

    if (middleName) {
      await middleNameInput.fill(middleName);
    }

    await lastNameInput.fill(lastName);
    await saveBtn.click();
  };

  const expectEmployeeCreated = async () => {
    await personalDetailsHeader.waitFor({ state: "visible" });
    await page.waitForURL(/viewPersonalDetails/i);
  };

  return {
    goto,
    addEmployee,
    expectEmployeeCreated
  };
};

module.exports = { pimAddEmployeePage };
