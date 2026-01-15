const toast = (page) => {
  const toastBox = page.locator(".oxd-toast");
  const text = page.locator(".oxd-toast .oxd-text");

  const expectVisible = async () => {
    await toastBox.waitFor({ state: "visible" });
  };

  const expectContains = async (re) => {
    await expectVisible();
    await text.waitFor({ state: "visible" });
    const t = await text.innerText();
    if (!re.test(t)) throw new Error(`Toast mismatch. Got: "${t}"`);
  };

  return { expectVisible, expectContains };
};

module.exports = { toast };
