# OrangeHRM E2E Automation Framework (Playwright)

A **production-style End-to-End (E2E) test automation framework** built using **Playwright with JavaScript**, targeting the **OrangeHRM Open Source Demo** application.

This repository showcases **real-world QA automation practices** including:
- Page Object Model (POM)
- Stable locator strategies
- Demo-safe test design
- Flaky UI handling
- Clear reporting with screenshots, videos, and traces

---

## Application Under Test

- **Application**: OrangeHRM Open Source Demo  
- **URL**: https://opensource-demo.orangehrmlive.com  
- **Environment**: Public demo (data resets periodically)

---

## Automated Test Coverage

The framework focuses on **modules that are reliable and safe to automate in a public demo environment**.

### Covered Modules

| Module | Scenario |
|------|---------|
| **Auth** | Login & storage state reuse |
| **My Info** | Emergency Contacts – Add & Delete (CRUD) |
| **Admin** | Nationalities – Add, Search & Delete (CRUD) |
| **Leave** | Leave List – Filter & Reset |
| **Time** | Timesheets – Search / View & Reset |
| **Claim** | Claim List – Search & Reset |

> Modules like **Buzz**, **Directory**, and **Performance Trackers** are intentionally excluded or guarded due to **role restrictions or unstable demo behavior**.

---

## Framework Architecture

The project follows a **scalable Page Object Model (POM)** design.

orangehrm-e2e-playwright-js/
│
├── src/
│ └── pages/ # Page Object files
│ ├── myinfo.emergencyContacts.page.js
│ ├── admin.nationalities.page.js
│ ├── leave.leaveList.page.js
│ ├── time.timesheets.page.js
│ ├── claim.claimList.page.js
│
├── tests/
│ ├── auth/
│ ├── myinfo/
│ ├── admin/
│ ├── leave/
│ ├── time/
│ ├── claim/
│
├── test-results/ # Screenshots, videos, traces
├── playwright.config.js
├── .env
└── README.md


---

## Design Principles

### Demo-Safe Automation
- No destructive or irreversible actions
- No dependency on fixed test data
- Reset and search validations instead of brittle assertions

### Stability & Reliability
- Explicit waits for loaders and spinners
- Fallback navigation strategies
- Defensive selectors (role-based + scoped locators)

### Interview-Ready Quality
- Clean, readable test steps
- Meaningful test names and annotations
- Screenshots after major actions

---

## 🛠️ Tech Stack

- **Playwright**
- **JavaScript**
- **Node.js**
- **dotenv**
- **Page Object Model (POM)**

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/<your-username>/orangehrm-e2e-playwright-js.git
cd orangehrm-e2e-playwright-js

2. Install Dependencies
npm install

3. Configure Environment Variables

Create a .env file in the root directory:

BASE_URL=https://opensource-demo.orangehrmlive.com
USERNAME=Admin
PASSWORD=admin123


These credentials are valid only for the OrangeHRM demo environment.

Running Tests
Run all tests
npx playwright test

Run a specific module
npx playwright test tests/myinfo

Run in headed mode
npx playwright test --headed

View HTML Report
npx playwright show-report

Test Artifacts

Playwright automatically captures:

Screenshots

Videos (on failure)

Trace files (for debugging)

Artifacts are stored under:

test-results/


To inspect a trace:

npx playwright show-trace test-results/**/trace.zip

Example Scenario: Emergency Contacts (My Info)

Navigate to My Info → Emergency Contacts

Add a new emergency contact

Verify the contact appears in the table

Delete the contact

Confirm successful removal via UI state

✔ Repeatable
✔ Isolated
✔ Demo-safe

Known Demo Limitations
Module	Reason
Buzz	Role-based access / disabled
Directory	Partial access & unstable data
Performance Trackers	404 in demo
Some Admin Actions	Elevated permissions required

All such cases are handled gracefully in test design.

Author

Kajal Nalage
Senior QA / Automation Engineer
Specialized in Playwright, E2E Automation, and Enterprise UI Testing

Final Note

This repository is intentionally designed to reflect how automation is written in real projects, not just to “make tests pass”.

If you are reviewing this for an interview or hiring decision:

Focus on structure

stability handling

and automation design choices

