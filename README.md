:wave: *New to our project? Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/). You may find the [Map of the Project](https://openmrs.github.io/openmrs-esm-core/#/main/map) especially helpful.* :teacher:	

![OpenMRS CI](https://github.com/openmrs/openmrs-esm-patient-chart/actions/workflows/ci.yml/badge.svg)

# OpenMRS ESM Patient Chart

The `openmrs-esm-patient-chart` is a frontend module for the OpenMRS SPA. It contains various microfrontends that constitute widgets in a patient dashboard. These widgets include:

- [Allergies](packages/esm-patient-allergies-app/README.md)
- [Appointments](packages/esm-patient-appointments-app/README.md)
- [Attachments](packages/esm-patient-attachments-app/README.md)
- [Biometrics](packages/esm-patient-biometrics-app/README.md)
- [Conditions](packages/esm-patient-conditions-app/README.md)
- [Forms](packages/esm-patient-forms-app/README.md)
- [Immunizations](packages/esm-patient-immunizations-app/README.md)
- [Medications](packages/esm-patient-medications-app/README.md)
- [Notes](packages/esm-patient-notes-app/README.md)
- [Patient banner](packages/esm-patient-banner-app/README.md)
- [Patient chart](packages/esm-patient-chart-app/README.md)
- [Programs](packages/esm-patient-programs-app/README.md)
- [Test results](packages/esm-patient-test-results-app/README.md)
- [Vitals](packages/esm-patient-vitals-app/README.md)

In addition to these widgets, two other microfrontends exist that encapsulate cross-cutting concerns. These are:

- [Common lib](packages/esm-patient-common-lib/README.md)
- [Patient chart](packages/esm-patient-chart-app/README.md)

## Setup

Check out the developer documentation [here](http://o3-dev.docs.openmrs.org).

This monorepo uses [yarn](https://yarnpkg.com) and [lerna](https://github.com/lerna/lerna).

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

Alternatively, you could run `yarn serve` from within the individual packages and then use [import map overrides](http://o3-dev.docs.openmrs.org/#/getting_started/setup?id=import-map-overrides).

## Running tests

To run tests for all packages, run:

```bash
yarn turbo test
```

To run tests in `watch` mode, run:

```bash
yarn turbo test:watch
```

To run tests for a specific package, pass the package name to the `--filter` flag. For example, to run tests for `esm-patient-conditions-app`, run:

```bash
yarn turbo test --filter="esm-patient-conditions-app"
```

To run a specific test file, run:

```bash
yarn turbo test -- visit-notes-form
```

The above command will only run tests in the file or files that match the provided string.

You can also run the matching tests from above in watch mode by running:

```bash
yarn turbo test:watch -- visit-notes-form
```

To generate a `coverage` report, run:

```bash
yarn turbo coverage
```

By default, `turbo` will cache test runs. This means that re-running tests wihout changing any of the related files will return the cached logs from the last run. To bypass the cache, run tests with the `force` flag, as follows:

```bash
yarn turbo test --force
```

To run end-to-end tests, run:

```bash
yarn test-e2e
```

Read the [e2e testing guide](/e2e/README.md) to learn more about End-to-End tests in this project.

## Troubleshooting

If you notice that your local version of the application is not working or that there's a mismatch between what you see locally versus what's in [dev3](https://dev3.openmrs.org/openmrs/spa), you likely have outdated versions of core libraries. To update core libraries, run the following commands:

```bash
# Upgrade core libraries
yarn up openmrs @openmrs/esm-framework

# Reset version specifiers to `next`. Don't commit actual version numbers.
git checkout package.json

# Run `yarn` to recreate the lockfile
yarn
```

## Layout

The patient chart consists of the following parts:

- Navigation menu
- Breadcrumbs menu
- Patient header
- Chart review / Dashboards
- Workspace
- Side menu

The **navigation menu** lives on the left side of the screen and provides links to dashboards in the patient chart.

The **breadcrumbs menu** gets shown at the top of the page under the navigation bar. It shows the user their current location relative to the information architecture and helps them quickly navigate to a parent level or previous step.

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

See [Creating a Distribution](http://o3-dev.docs.openmrs.org/#/main/distribution?id=creating-a-distribution) for information about adding microfrontends to a distribution.
