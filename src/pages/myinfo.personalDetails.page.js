const myInfoPersonalDetailsPage = (page) => {
  const header = page.getByRole("heading", { name: /personal details/i });

  const pageLoader = page.locator(".oxd-loading-spinner");
  const formLoader = page.locator(".oxd-form-loader");

  const form = page.locator("form").first();

  const allTextInputs = form.locator('input.oxd-input');

  const firstNameByLabel = form.locator(
    '.oxd-input-group:has(label:has-text("First Name")) input'
  );

  const saveBtn = form.getByRole("button", { name: /^save$/i });

  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const waitForReady = async () => {
    try { await pageLoader.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
    try { await formLoader.waitFor({ state: "hidden", timeout: 15000 }); } catch (e) {}
  };

  const clearAndType = async (input, value) => {
    await waitForReady();
    await input.scrollIntoViewIfNeeded();
    await input.waitFor({ state: "visible", timeout: 15000 });

    try {
      await input.click({ timeout: 5000 });
    } catch (e) {
      await input.focus();
    }

    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    await input.type(value, { delay: 20 });
  };

  const goto = async () => {
  await page.goto("/web/index.php/pim/viewMyDetails", { waitUntil: "domcontentloaded" });

  await page.waitForURL(/\/web\/index\.php\/pim\/view(MyDetails|PersonalDetails)/, {
    timeout: 45000
  });

  await header.waitFor({ state: "visible", timeout: 45000 });

  await waitForReady();
  await form.waitFor({ state: "visible", timeout: 45000 });
};


  const updateName = async ({ firstName, middleName, lastName }) => {
    const firstNameInput = (await firstNameByLabel.count())
      ? firstNameByLabel.first()
      : allTextInputs.nth(0);

    const middleNameInput = allTextInputs.nth(1);
    const lastNameInput = allTextInputs.nth(2);

    if (firstName) await clearAndType(firstNameInput, firstName);
    if (middleName) await clearAndType(middleNameInput, middleName);
    if (lastName) await clearAndType(lastNameInput, lastName);

    await waitForReady();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await waitForReady();
  };

  const waitForToast = async () => {
    await toastMsg.first().waitFor({ state: "visible", timeout: 20000 });
    return (await toastMsg.first().innerText()).trim();
  };

  return { goto, updateName, waitForToast };
};

module.exports = { myInfoPersonalDetailsPage };
