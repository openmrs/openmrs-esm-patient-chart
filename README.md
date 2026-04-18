# OpenMRS ESM Patient Chart

[![OpenMRS CI](https://github.com/openmrs/openmrs-esm-patient-chart/actions/workflows/ci.yml/badge.svg)](https://github.com/openmrs/openmrs-esm-patient-chart/actions/workflows/ci.yml)
[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

> New to the project? Start with the [OpenMRS 3 Frontend Developer Documentation](https://om.rs/dev3docs).

A frontend monorepo for the [OpenMRS 3](https://openmrs.org/) Single Page Application (SPA). This package provides the patient chart experience - a collection of microfrontend widgets that together form a comprehensive, extensible patient dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Microfrontends](#microfrontends)
- [Layout](#layout)
- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [End-to-End Tests](#end-to-end-e2e-tests)
- [Design Patterns](#design-patterns)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

`openmrs-esm-patient-chart` is a [Turborepo](https://turbo.build/repo)-based monorepo that uses [Yarn](https://yarnpkg.com/) as its package manager. It groups multiple clinical microfrontends that are rendered together as a unified patient chart in the OpenMRS SPA.

---

## Microfrontends

### Clinical Widgets

| Package | Description |
|---|---|
| `esm-patient-allergies-app` | Record and review patient allergies and adverse reactions |
| `esm-patient-attachments-app` | Upload and view file attachments (e.g. images, documents) |
| `esm-patient-conditions-app` | Manage active and historical patient conditions |
| `esm-patient-flags-app` | Highlight important clinical flags on a patient record |
| `esm-patient-forms-app` | Access and fill clinical forms |
| `esm-patient-immunizations-app` | Track patient immunization history and schedules |
| `esm-patient-lists-app` | Manage patient cohort lists |
| `esm-patient-medications-app` | View and manage current and past medications |
| `esm-patient-notes-app` | Record and view clinical notes and visit summaries |
| `esm-patient-orders-app` | Create and manage patient orders |
| `esm-patient-programs-app` | Enroll and track patients in care programs |
| `esm-patient-test-results-app` | View laboratory and diagnostic test results |
| `esm-patient-vitals-app` | Record and visualize vital signs |
| `esm-patient-biometrics-app` | Track biometric measurements (height, weight, BMI, etc.) |

### Cross-cutting Packages

| Package | Description |
|---|---|
| `esm-patient-chart-app` | Core patient chart shell; handles routing, layout, and workspace |
| `esm-patient-common-lib` | Shared utilities, types, and UI components used across widgets |
| `esm-patient-banner-app` | Displays the patient header/banner at the top of the chart |

---

## Layout

The patient chart is composed of the following regions:

```text
+---------------------------------------------------------+
|                     Patient Banner                      |
+----------+----------------------------------+-----------+
|          |                                  |           |
|   Nav    |       Chart Review / Dashboard   |   Side    |
|   Menu   |                                  |   Menu    |
|          |                                  |           |
|          +----------------------------------+           |
|          |           Workspace              |           |
+----------+----------------------------------+-----------+
```

- **Navigation Menu** - Left sidebar with links to dashboards.
- **Patient Banner** - Displays patient demographics and toast notifications.
- **Chart Review / Dashboards** - Main content area. A dashboard is a collection of widget tiles.
- **Workspace** - Data entry panel. Full-screen on mobile; sidebar on desktop.
- **Side Menu** - Access to features without dedicated pages (e.g. notifications).

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Yarn](https://yarnpkg.com/)

### Install dependencies

```bash
yarn
```

---

## Development

### Start a dev server for a single microfrontend

```bash
yarn start --sources 'packages/esm-patient-<package-name>-app'
```

**Example - start the allergies app:**

```bash
yarn start --sources 'packages/esm-patient-allergies-app'
```

This uses the OpenMRS tooling to spin up a dev server running `esm-patient-chart` alongside your specified microfrontend.

### Start dev servers for multiple microfrontends simultaneously

**Option 1 - Pass multiple `--sources` flags:**

```bash
yarn start \
  --sources 'packages/esm-patient-vitals-app' \
  --sources 'packages/esm-patient-biometrics-app'
```

**Option 2 - Use `yarn serve` with import map overrides:**

Run `yarn serve` from within individual packages, then use [import map overrides](https://github.com/single-spa/import-map-overrides) in the browser to wire them together.

---

## Testing

This project uses [Vitest](https://vitest.dev/) for unit and integration tests, orchestrated through [Turborepo](https://turbo.build/repo).

### Run all tests

```bash
yarn turbo run test
```

### Run tests in watch mode

```bash
yarn turbo run test:watch
```

### Run tests for a specific package

Use the `--filter` flag with the full package name:

```bash
yarn turbo run test --filter=@openmrs/esm-patient-conditions-app
```

### Run a specific test file

Pass a filename substring to match:

```bash
yarn turbo run test -- visit-notes-form
```

### Run a specific test file in interactive watch mode

Turborepo's TUI (terminal UI) is required for interactive mode:

```bash
yarn turbo run test:watch --ui tui -- visit-notes-form
```

Then press **Enter** in the Turbo UI to activate interactive mode.

### Generate a coverage report

```bash
yarn turbo run coverage
```

### Bypass Turborepo's test cache

By default, Turborepo caches test results. If you want to force a fresh run:

```bash
yarn turbo run test --force
```

---

## End-to-End (E2E) Tests

E2E tests are written with [Playwright](https://playwright.dev/) and live in the `e2e/` directory (`*.spec.ts` files).

### Initial setup

```bash
# Install Playwright browsers
npx playwright install
```

Copy the example environment file:

```bash
# macOS / Linux
cp example.env .env

# Windows PowerShell
Copy-Item example.env .env
```

### Configure the test target

By default, tests run against a local backend at `http://localhost:8080/openmrs`.

To test against a remote instance (e.g. the OpenMRS reference application), update `E2E_BASE_URL` in your `.env` file:

```env
E2E_BASE_URL=https://dev3.openmrs.org/openmrs
```

### Run E2E tests

| Command | Description |
|---|---|
| `yarn test-e2e` | Run all E2E tests in headless mode |
| `yarn test-e2e --headed` | Run tests with a visible browser window |
| `yarn test-e2e --ui` | Run tests in Playwright's interactive UI/debugger |
| `yarn test-e2e --headed --ui` | Headed mode + interactive UI (recommended for development) |
| `yarn test-e2e <test-name>` | Run a specific test file by name |

**Example - test local changes to the Allergies app:**

```bash
# 1. Start the dev server
yarn start --sources packages/esm-patient-allergies-app

# 2. In a separate terminal, run E2E tests
yarn test-e2e
```

### Updating Playwright

> Warning: The Playwright version in `package.json` and in the Bamboo E2E Dockerfile **must always match**. If you update one, update the other.

For more detail, refer to the [E2E testing guide](https://o3-docs.openmrs.org/docs/frontend-modules/testing/e2e-tests).

---

## Design Patterns

UI components follow the [OpenMRS 3 Design System](https://zeroheight.com/23a080e38/p/880723-introduction). Please consult the design system documentation before building new components to ensure consistency across the platform.

---

## Configuration

Module configuration is documented in the [OpenMRS Implementer Documentation](https://wiki.openmrs.org/display/projects/OpenMRS+3.x+Implementer+Documentation). Configurable options vary per microfrontend and can be set via the OpenMRS frontend config system.

---

## Deployment

See [Creating a Distribution](https://wiki.openmrs.org/display/projects/Creating+a+Distribution) for guidance on bundling and including these microfrontends in an OpenMRS distribution.

---

## Troubleshooting

### App behavior differs from `dev3` / local version appears outdated

You likely have stale core library versions. Run the following to update them:

```bash
# Upgrade to the latest next versions
yarn up openmrs@next @openmrs/esm-framework@next

# If `package.json` now contains pinned versions, change them back to `next`
# before committing.

# Regenerate the lockfile
yarn
```

### Tests are returning stale results

Turborepo caches test runs. Force a fresh run:

```bash
yarn turbo run test --force
```

---

## Contributing

Contributions are welcome! Please:

1. Review the [OpenMRS Frontend Developer Documentation](https://om.rs/dev3docs) before starting.
2. Follow the existing [Design Patterns](#design-patterns).
3. Add or update tests for any changes.
4. Ensure all tests pass (`yarn turbo run test`) before opening a PR.
5. Keep the CI green - check the badge at the top of this README.

For questions, join the [OpenMRS Community](https://talk.openmrs.org/) or the `#openmrs-dev` Slack channel.

---

*This site is open source. [Improve this page](https://github.com/openmrs/openmrs-esm-patient-chart).*
