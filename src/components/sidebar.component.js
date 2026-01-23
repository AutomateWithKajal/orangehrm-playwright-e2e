const sidebar = (page) => {
  const menu = page.locator("aside.oxd-sidepanel");

  const click = async (name) => {
    const link = page.getByRole("link", { name: new RegExp(`^${name}$`, "i") });
    await link.click();
  };

  const getVisibleMenuNames = async () => {
    const links = menu.getByRole("link");
    const count = await links.count();
    const names = [];
    for (let i = 0; i < count; i++) {
      const t = (await links.nth(i).innerText()).trim();
      if (t) names.push(t);
    }
    return [...new Set(names)];
  };

  return { click, getVisibleMenuNames };
};

module.exports = { sidebar };
