const { test, expect } = require("@playwright/test");
const { pimAddEmployeePage } = require("../../src/pages/pim.addEmployee.page");
const { pimEmployeeListPage } = require("../../src/pages/pim.employeeList.page");

test.describe("PIM - Employee Management", () => {
  test("@e2e Add employee → Validate → Search in list", async ({ page }) => {
    const addEmployee = pimAddEmployeePage(page);
    const employeeList = pimEmployeeListPage(page);

    const employee = {
      firstName: "kajal",
      middleName: "QA",
      lastName: `Auto${Date.now()}`
    };

    await test.step("Add new employee", async () => {
      await addEmployee.goto();
      await addEmployee.addEmployee(employee);
      await addEmployee.expectEmployeeCreated();

      await page.screenshot({
        path: `test-results/pim/add-employee-${employee.lastName}.png`,
        fullPage: true
      });
    });

    await test.step("Search employee in employee list", async () => {
      await employeeList.goto();
      await employeeList.searchByEmployeeName(`${employee.firstName} ${employee.lastName}`);
      await employeeList.expectEmployeeInResults(employee.lastName);

      await page.screenshot({
        path: `test-results/pim/search-employee-${employee.lastName}.png`,
        fullPage: true
      });
    });

    await expect(page).toHaveURL(/viewEmployeeList/i);
  });
});
