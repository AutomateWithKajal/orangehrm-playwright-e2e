const loginPage = (page) => {
  const username = page.locator('input[name="username"]');
  const password = page.locator('input[name="password"]');
  const submit = page.locator('button[type="submit"]');
  const error = page.locator(".oxd-alert-content-text");

  const goto = async () => {
    await page.goto("/web/index.php/auth/login");
    await username.waitFor({ state: "visible" });
  };

  const login = async (u, p) => {
    await username.fill(u);
    await password.fill(p);
    await submit.click();
  };

  const expectInvalid = async () => {
    await error.waitFor({ state: "visible" });
  };

  return { goto, login, expectInvalid };
};

module.exports = { loginPage };
