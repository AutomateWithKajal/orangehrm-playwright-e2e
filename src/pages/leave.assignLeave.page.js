const leaveAssignPage = (page) => {
  const header = page.getByRole("heading", { name: /assign leave/i });
  const form = page.locator("form");
  const loader = page.locator(".oxd-form-loader");

  const employeeNameInput = form.locator(
    '.oxd-input-group:has(label:has-text("Employee Name")) input'
  );

  const leaveTypeDropdown = form.locator(
    '.oxd-input-group:has(label:has-text("Leave Type")) .oxd-select-text'
  );

  const fromDateInput = form.locator(
    '.oxd-input-group:has(label:has-text("From Date")) input'
  );

  const toDateInput = form.locator(
    '.oxd-input-group:has(label:has-text("To Date")) input'
  );

  const commentInput = form.locator(
    '.oxd-input-group:has(label:has-text("Comment")) textarea'
  );
    const confirmDialog = page.locator(".oxd-dialog-container-default");
  const confirmTitle = confirmDialog.getByText(/confirm leave assignment/i);
  const okBtn = confirmDialog.getByRole("button", { name: /^ok$/i });
  const cancelBtn = confirmDialog.getByRole("button", { name: /cancel/i });


  const assignBtn = form.getByRole("button", { name: /assign/i });

  const waitForReady = async () => {
    try {
      await loader.waitFor({ state: "hidden", timeout: 15000 });
    } catch (e) {
    }
  };

  const goto = async () => {
    await page.goto("/web/index.php/leave/assignLeave");
    await header.waitFor({ state: "visible" });
    await waitForReady();
  };

    const pickFirstAutocomplete = async () => {
    const dropdown = page.locator(".oxd-autocomplete-dropdown");
    await dropdown.waitFor({ state: "visible", timeout: 10000 });

    const suggestion = dropdown.locator("span").first();
    await suggestion.waitFor({ state: "visible", timeout: 10000 });
    const picked = (await suggestion.innerText()).trim();

    await suggestion.click();
    await waitForReady();

    await employeeNameInput.waitFor({ state: "visible" });
    await page.waitForTimeout(200);

    const current = await employeeNameInput.inputValue();
    if (!current || current.trim().length < 2) {
      await employeeNameInput.click();
      await employeeNameInput.press("ArrowDown");
      await employeeNameInput.press("Enter");
      await waitForReady();
    }

    return picked;
  };

  const setEmployeeName = async (text = "a") => {
    await waitForReady();
    await employeeNameInput.click();
    await employeeNameInput.fill(text);

    await page.waitForTimeout(300);

    return await pickFirstAutocomplete();
  };


  const openDropdown = async (dropdown) => {
    await waitForReady();
    await dropdown.scrollIntoViewIfNeeded();
    await dropdown.click();
  };

   const pickLeaveType = async (preferredText) => {
  await waitForReady();
  await leaveTypeDropdown.scrollIntoViewIfNeeded();
  await leaveTypeDropdown.click();

  const options = page.locator('[role="option"]');
  await options.first().waitFor({ state: "visible", timeout: 10000 });

  const isPlaceholder = async (loc) => {
    const t = (await loc.innerText()).trim();
    return /^--\s*select\s*--$/i.test(t) || /^select$/i.test(t);
  };

  if (preferredText) {
    const preferred = options.filter({ hasText: new RegExp(preferredText, "i") });
    if (await preferred.count()) {
      const cand = preferred.first();
      if (!(await isPlaceholder(cand))) {
        await cand.click();
        await waitForReady();
      }
    }
  }

  const dropdownText = (await leaveTypeDropdown.innerText()).trim();
  if (/select/i.test(dropdownText)) {
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      if (!(await isPlaceholder(opt))) {
        await opt.click();
        await waitForReady();
        break;
      }
    }
  }

  const finalText = (await leaveTypeDropdown.innerText()).trim();
  if (/select/i.test(finalText)) {
    throw new Error("Leave Type was not selected (still shows Select).");
  }
};
const setDate = async (input, value) => {
  await waitForReady();
  await input.scrollIntoViewIfNeeded();
  await input.click();

  await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await input.press("Backspace");

  await input.type(value, { delay: 30 });
};



  const assignLeave = async ({ employeeQuery, leaveType, fromDate, toDate, comment }) => {
    await setEmployeeName(employeeQuery || "a");
    await pickLeaveType(leaveType);

    await waitForReady();
    await setDate(fromDateInput, fromDate);

    await waitForReady();
    await setDate(toDateInput, toDate);

    if (comment) {
      await waitForReady();
      await commentInput.fill(comment);
    }

       await waitForReady();
    await assignBtn.click();
    await waitForReady();

    if (await confirmDialog.isVisible().catch(() => false)) {
      await confirmTitle.waitFor({ state: "visible", timeout: 10000 });

      await page.screenshot({
        path: "test-results/leave/assign-leave-confirm-modal.png",
        fullPage: true
      });

      await okBtn.click();
      await waitForReady();
    }

  };

   const waitForOutcome = async () => {
  const toastMsg = page.locator(
    "#oxd-toaster_1 .oxd-toast-content-text, #oxd-toaster_1 .oxd-text--toast-message"
  );

  const fieldError = page.locator(".oxd-input-field-error-message");
  const alertMsg = page.locator(".oxd-alert-content-text");

  const dialog = page.locator(".oxd-dialog-container-default");
  const insufficientText = dialog.getByText(/does not have sufficient leave balance/i);
  const okBtn = dialog.getByRole("button", { name: /^ok$/i });

  const noBalanceMsg = page.getByText(/no leave types with leave balance/i);

  const waitDialogClose = async () => {
    try {
      await dialog.waitFor({ state: "hidden", timeout: 15000 });
    } catch (e) {
      
    }
  };

  for (let i = 0; i < 2; i++) {
    if (await dialog.isVisible().catch(() => false)) {
      if (await insufficientText.isVisible().catch(() => false)) {
        await page.screenshot({
          path: "test-results/leave/assign-leave-confirm-modal.png",
          fullPage: true
        });

        await okBtn.click();
        await waitDialogClose();
      } else {
        if (await okBtn.count()) {
          await okBtn.click();
          await waitDialogClose();
        }
      }
    }

    try {
      const winner = await Promise.race([
        toastMsg.first().waitFor({ state: "visible", timeout: 15000 }).then(() => "toast"),
        fieldError.first().waitFor({ state: "visible", timeout: 15000 }).then(() => "fieldError"),
        alertMsg.first().waitFor({ state: "visible", timeout: 15000 }).then(() => "alert"),
        noBalanceMsg.waitFor({ state: "visible", timeout: 15000 }).then(() => "noBalance")
      ]);

      if (winner === "toast") {
        const msg = (await toastMsg.first().innerText()).trim();
        return { type: /success|successfully/i.test(msg) ? "success" : "toast", message: msg };
      }

      if (winner === "fieldError") {
        const msg = (await fieldError.first().innerText()).trim();
        return { type: "fieldError", message: msg };
      }

      if (winner === "alert") {
        const msg = (await alertMsg.first().innerText()).trim();
        return { type: "alert", message: msg };
      }

      return { type: "blocked", message: "No Leave Types with Leave Balance" };
    } catch (e) {
      if (!(await dialog.isVisible().catch(() => false))) {
        return { type: "submitted", message: "Submitted (no toast shown in demo)" };
      }
    }
  }

  return { type: "unknown", message: "No toast/alert and dialog state unclear" };
};

  return { goto, assignLeave, waitForOutcome };

};

module.exports = { leaveAssignPage };
