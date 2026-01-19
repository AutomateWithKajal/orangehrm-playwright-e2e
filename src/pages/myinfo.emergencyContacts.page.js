const { expect } = require("@playwright/test");

const myInfoEmergencyContactsPage = (page) => {
  const loader = page.locator(".oxd-form-loader");
  const spinner = page.locator(".oxd-loading-spinner");

  const emergencyLink = page.getByRole("link", { name: /emergency contacts/i });
  const header = page.getByRole("heading", { name: /emergency contacts/i });

  const assignedHeader = page.getByRole("heading", { name: /assigned emergency contacts/i });

  const assignedSection = assignedHeader
    .locator("xpath=ancestor::div[contains(@class,'orangehrm-card-container')][1]")
    .first();

  const addBtn = assignedSection.getByRole("button", { name: /\+?\s*add/i }).first();

  const table = assignedSection.locator(".oxd-table").first();
  const rows = table.locator(".oxd-table-card");

  const nameInput = page
    .locator('form .oxd-input-group:has(label:has-text("Name")) input')
    .first();
  const relationshipInput = page
    .locator('form .oxd-input-group:has(label:has-text("Relationship")) input')
    .first();
  const homeTelInput = page
    .locator('form .oxd-input-group:has(label:has-text("Home Telephone")) input')
    .first();
  const mobileInput = page
    .locator('form .oxd-input-group:has(label:has-text("Mobile")) input')
    .first();

  const saveBtn = page.getByRole("button", { name: /^save$/i });

  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const waitForReady = async () => {
    try {
      await spinner.waitFor({ state: "hidden", timeout: 15000 });
    } catch {}
    try {
      await loader.waitFor({ state: "hidden", timeout: 15000 });
    } catch {}
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 15000 });

    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    await input.type(String(value), { delay: 15 });
  };

  const waitForToast = async (timeout = 8000) => {
    try {
      await toastMsg.first().waitFor({ state: "visible", timeout });
      return (await toastMsg.first().innerText()).trim();
    } catch {
      return null;
    }
  };

  const goto = async () => {
    await page.goto("/web/index.php/pim/viewMyDetails", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForURL(/\/web\/index\.php\/pim\/view(MyDetails|PersonalDetails)/, {
      timeout: 45000,
    });

    await emergencyLink.click();
    await page.waitForURL(/\/web\/index\.php\/pim\/viewEmergencyContacts/, {
      timeout: 45000,
    });

    await header.waitFor({ state: "visible", timeout: 45000 });

    await assignedHeader.waitFor({ state: "visible", timeout: 45000 });

    await waitForReady();
  };

  const openAdd = async () => {
    await waitForReady();

    await addBtn.waitFor({ state: "visible", timeout: 20000 });
    await addBtn.scrollIntoViewIfNeeded();

    try {
      await addBtn.click({ timeout: 8000 });
    } catch {
      await addBtn.click({ force: true });
    }

    await waitForReady();
  };

  const addContact = async ({ name, relationship, homeTelephone, mobile }) => {
    await openAdd();

    await clearAndType(nameInput, name);
    if (relationship) await clearAndType(relationshipInput, relationship);
    if (homeTelephone) await clearAndType(homeTelInput, homeTelephone);
    if (mobile) await clearAndType(mobileInput, mobile);

    await waitForReady();
    await saveBtn.click();
    await waitForReady();
  };

  const findRowByName = async (name) => {
    await waitForReady();

    await expect(table).toBeVisible({ timeout: 20000 });

    return rows.filter({ hasText: name }).first();
  };

  const deleteByName = async (name) => {
    const row = await findRowByName(name);
    await expect(row).toBeVisible({ timeout: 20000 });

    const deleteBtn = row.locator("button:has(i.bi-trash)").first();
    await deleteBtn.click();

    const confirm = page.locator(".oxd-dialog-container-default");
    const yesDelete = confirm.getByRole("button", { name: /yes,\s*delete/i });
    await yesDelete.waitFor({ state: "visible", timeout: 15000 });
    await yesDelete.click();

    await waitForReady();

    await expect(rows.filter({ hasText: name }).first()).toHaveCount(0, { timeout: 20000 });

    await waitForToast(1500);
  };

  return {
    goto,
    addContact,
    waitForToast,
    findRowByName,
    deleteByName,
  };
};

module.exports = { myInfoEmergencyContactsPage };
