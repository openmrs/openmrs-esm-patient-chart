:wave: **New to our project?** Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.atlassian.net/wiki/x/IABBHg) :teacher:

![OpenMRS CI](https://github.com/openmrs/openmrs-esm-patient-chart/actions/workflows/ci.yml/badge.svg)

# OpenMRS ESM Patient Chart

The `openmrs-esm-patient-chart` is a frontend module for the OpenMRS SPA. It contains various microfrontends that constitute widgets in a patient dashboard. These widgets include:

- [Allergies](packages/esm-patient-allergies-app/README.md)
- [Attachments](packages/esm-patient-attachments-app/README.md)
- [Conditions](packages/esm-patient-conditions-app/README.md)
- [Flags](packages/esm-patient-flags-app/README.md)
- [Forms](packages/esm-patient-forms-app/README.md)
- [Immunizations](packages/esm-patient-immunizations-app/README.md)
- [Lists](packages/esm-patient-lists-app/README.md)
- [Medications](packages/esm-patient-medications-app/README.md)
- [Notes](packages/esm-patient-notes-app/README.md)
- [Orders](packages/esm-patient-orders-app/README.md)
- [Patient banner](packages/esm-patient-banner-app/README.md)
- [Programs](packages/esm-patient-programs-app/README.md)
- [Tests](packages/esm-patient-tests-app/README.md)
- [Vitals and Biometrics](packages/esm-patient-vitals-app/README.md)

In addition to these widgets, two other microfrontends exist that encapsulate cross-cutting concerns. These are:

- [Common lib](packages/esm-patient-common-lib/README.md)
- [Patient chart](packages/esm-patient-chart-app/README.md)

## Setup

Check out the developer documentation [in the Wiki](https://openmrs.atlassian.net/wiki/x/IABBHg).

This monorepo uses [yarn](https://yarnpkg.com).

To install the dependencies, run:

```bash
yarn
```

To start a dev server for a specific microfrontend, run:

```bash
yarn start --sources 'packages/esm-patient-<insert-package-name>-app'
```

This command uses the [openmrs](https://www.npmjs.com/package/openmrs) tooling to fire up a dev server running `esm-patient-chart` as well as the specified microfrontend.

There are two approaches for working on multiple microfrontends simultaneously.

You could run `yarn start` with as many `sources` arguments as you require. For example, to run the biometrics and vitals microfrontends simultaneously, you'd use:

```bash
yarn start --sources 'packages/esm-patient-biometrics-app' --sources 'packages/esm-patient-vitals-app'
```

Alternatively, you could run `yarn serve` from within the individual packages and then use [import map overrides](https://openmrs.atlassian.net/wiki/spaces/docs/pages/150962685/Develop+Frontend+Modules#Using-import-map-overrides).

## Running unit and integration tests

To run unit and integration tests for all packages, run:

```bash
yarn turbo run test
```

To run tests in `watch` mode, run:

```bash
yarn turbo run test:watch
```

To run tests for a specific package, pass the package name to the `--filter` flag. For example, to run tests for `esm-patient-conditions-app`, run:

```bash
yarn turbo run test --filter=@openmrs/esm-patient-conditions-app
```

To run a specific test file, run:

```bash
yarn turbo run test -- visit-notes-form
```

The above command will only run tests in the file or files that match the provided string.

You can also run the matching tests from above in watch mode. In order to interact with the test runner, you will need to tell Turborepo to use the "tui" UI. Use the following command
and then press "enter" in the Turbo UI to activate interactive mode.

```bash
yarn turbo run test:watch --ui tui -- visit-notes-form
```

To generate a `coverage` report, run:

```bash
yarn turbo run coverage
```

By default, `turbo` will cache test runs. This means that re-running tests wihout changing any of the related files will return the cached logs from the last run. To bypass the cache, run tests with the `force` flag, as follows:

```bash
yarn turbo run test --force
```

## Running End-to-End (E2E) tests

This repository uses [Playwright](https://playwright.dev/) for E2E coverage. The full local setup is documented in [e2e/README.md](e2e/README.md).

### Quick start

1. Install dependencies:

```bash
yarn
```

2. Install the Playwright browser used by this project:

```bash
npx playwright install chromium
```

3. Create a local environment file:

```bash
cp example.env .env
```

On Windows PowerShell, use:

```powershell
Copy-Item example.env .env
```

4. Start the frontend against the backend you want to test. For example:

```bash
yarn start --sources packages/esm-patient-allergies-app
```

By default, tests run against `http://localhost:8080/openmrs`. To point the suite at another backend, update `E2E_BASE_URL` in `.env`. For example:

```env
E2E_BASE_URL=https://dev3.openmrs.org/openmrs
```

5. Run the tests:

```bash
yarn test-e2e
```

### Common commands

Run all E2E tests in headed mode:

```bash
yarn test-e2e --headed
```

Run tests in Playwright UI mode:

```bash
yarn test-e2e --ui
```

Run a single spec file:

```bash
yarn test-e2e e2e/specs/allergies.spec.ts
```

Run tests matching a name:

```bash
yarn test-e2e --grep "Allergies"
```

After a run, open `playwright-report/index.html` to inspect the HTML report.

Read the [e2e testing guide](https://openmrs.atlassian.net/wiki/x/K4L-C) for broader testing guidance.

### Updating Playwright

The Playwright version in the [Bamboo e2e Dockerfile](e2e/support/bamboo/playwright.Dockerfile#L2) and the `package.json` file must match. If you update the Playwright version in one place, you must update it in the other.

## Troubleshooting

If you notice that your local version of the application is not working or that there's a mismatch between what you see locally versus what's in [dev3](https://dev3.openmrs.org/openmrs/spa), you likely have outdated versions of core libraries. To update core libraries, run the following commands:

```bash
# Upgrade core libraries
yarn up openmrs@next @openmrs/esm-framework@next

# Reset version specifiers to `next`. Don't commit actual version numbers.
git checkout package.json

# Run `yarn` to recreate the lockfile
yarn
```

## Layout

The patient chart consists of the following parts:

- Navigation menu
- Patient header
- Chart review / Dashboards
- Workspace
- Side menu

The **navigation menu** lives on the left side of the screen and provides links to dashboards in the patient chart.

The **patient header** contains the [patient banner](packages/esm-patient-banner-app/README.md). Uninvasive notifications also appear in this area following actions such as form submissions.

The **chart review** area is the main part of the screen. It displays whatever dashboard is active.

A **dashboard** is a collection of widgets.

The **workspace** is where data entry takes place. On mobile devices it covers the screen; on desktop it appears in a sidebar.

The **side menu** provides access to features that do not have their own pages, such as the notifications menu.

## Design Patterns

For documentation about our design patterns, please visit our [design system](https://zeroheight.com/23a080e38/p/880723--introduction) documentation website.

## Configuration

Please see the [Implementer Documentation](https://wiki.openmrs.org/pages/viewpage.action?pageId=224527013) for information about configuring modules.

## Deployment

See [Creating a Distribution](https://openmrs.atlassian.net/wiki/x/xoIBCQ) for information about adding microfrontends to a distribution.
