# End-to-End Testing

This repository uses [Playwright](https://playwright.dev/) for end-to-end tests. The test specs live in [`e2e/specs`](./specs), and the suite is run with:

```bash
yarn test-e2e
```

## Before you run the tests

### 1. Install dependencies

```bash
yarn
```

### 2. Install Playwright browsers

The current Playwright project is configured to run against Chromium, so install that browser locally:

```bash
npx playwright install chromium
```

### 3. Create a local `.env` file

Copy the example environment file:

```bash
cp example.env .env
```

If you are using Windows PowerShell:

```powershell
Copy-Item example.env .env
```

The Playwright config loads values from `.env` automatically.

## Required environment variables

These values are defined in [`example.env`](../example.env):

- `E2E_BASE_URL`: Base URL of the OpenMRS backend, for example `http://localhost:8080/openmrs`
- `E2E_USER_ADMIN_USERNAME`: Username used by the global setup step to authenticate before tests run
- `E2E_USER_ADMIN_PASSWORD`: Password for the test user
- `E2E_LOGIN_DEFAULT_LOCATION_UUID`: Default login location UUID used during test setup

## Choosing the backend to test

### Local backend

The default `.env` targets a local backend:

```env
E2E_BASE_URL=http://localhost:8080/openmrs
```

If you want to verify local frontend changes, make sure the app is running before starting Playwright. For example:

```bash
yarn start --sources packages/esm-patient-allergies-app
```

### Remote backend

To run the same suite against a remote environment such as `dev3`, update your `.env` file:

```env
E2E_BASE_URL=https://dev3.openmrs.org/openmrs
```

Make sure the remote instance is compatible with the feature you are testing and that the configured credentials are valid there.

## Common commands

Run the full suite in headless mode:

```bash
yarn test-e2e
```

Run with a visible browser:

```bash
yarn test-e2e --headed
```

Open Playwright UI mode for debugging:

```bash
yarn test-e2e --ui
```

Run a single spec file:

```bash
yarn test-e2e e2e/specs/allergies.spec.ts
```

Run a subset of tests by name:

```bash
yarn test-e2e --grep "Allergies"
```

## Debugging tips

- If authentication fails before any spec starts, verify the admin username, password, and login location values in `.env`.
- If the browser opens but the app does not load, double-check `E2E_BASE_URL`.
- If you are testing local frontend code, make sure your dev server is still running when Playwright starts.
- After each run, inspect `playwright-report/index.html` for screenshots, traces, and failure details.

## Related references

- Main project guide: [README.md](../README.md)
- OpenMRS E2E testing guide: https://openmrs.atlassian.net/wiki/x/K4L-C
