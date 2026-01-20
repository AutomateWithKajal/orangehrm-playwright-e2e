const { expect } = require("@playwright/test");

const myInfoContactDetailsPage = (page) => {
  const spinner = page.locator(".oxd-loading-spinner");
  const loader = page.locator(".oxd-form-loader");

  const contactLink = page.getByRole("link", { name: /contact details/i });
  const header = page.getByRole("heading", { name: /contact details/i });

  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const street1 = page.locator('form .oxd-input-group:has(label:has-text("Street 1")) input').first();
  const city = page.locator('form .oxd-input-group:has(label:has-text("City")) input').first();
  const mobile = page.locator('form .oxd-input-group:has(label:has-text("Mobile")) input').first();
  const workEmail = page.locator('form .oxd-input-group:has(label:has-text("Work Email")) input').first();

  const saveBtn = page.getByRole("button", { name: /^save$/i }).first();

  const waitForReady = async () => {
    try { await spinner.waitFor({ state: "hidden", timeout: 15000 }); } catch {}
    try { await loader.waitFor({ state: "hidden", timeout: 15000 }); } catch {}
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
    await page.goto("/web/index.php/pim/viewMyDetails", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/web\/index\.php\/pim\/view(MyDetails|PersonalDetails)/, { timeout: 45000 });

    await contactLink.click();
    await page.waitForURL(/\/web\/index\.php\/pim\/contactDetails/, { timeout: 45000 });

    await header.waitFor({ state: "visible", timeout: 45000 });
    await waitForReady();
  };

  const updateContact = async ({ street, cityName, mobileNo, email }) => {
    if (street) await clearAndType(street1, street);
    if (cityName) await clearAndType(city, cityName);
    if (mobileNo) await clearAndType(mobile, mobileNo);
    if (email) await clearAndType(workEmail, email);

    await waitForReady();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await waitForReady();
  };

  const expectMobileValue = async (value) => {
    await expect(mobile).toHaveValue(value, { timeout: 15000 });
  };

  return { goto, updateContact, waitForToast, expectMobileValue };
};

module.exports = { myInfoContactDetailsPage };
