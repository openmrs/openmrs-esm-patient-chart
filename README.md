:wave:	*New to our project? Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/). You may find the [Map of the Project](https://openmrs.github.io/openmrs-esm-core/#/main/map) especially helpful.* :teacher:	

![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-chart/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Patient Chart

The `openmrs-esm-patient-chart` is a frontend module for the OpenMRS SPA. It bundles together various microfrontends that constitute widgets in a patient dashboard. These widgets include:

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

To start a dev server for a specific microfrontend, run:

```bash
yarn start --sources 'packages/esm-patient-<insert-package-name>-app'
```

This command uses the [openmrs](https://www.npmjs.com/package/openmrs) tooling to fire up a dev server running `esm-patient-chart` as well as the specified microfrontend.

To start a dev server running all the packages, run:

```bash
yarn start-all
```

Note that this is very resource-intensive. 

There are two approaches for working on multiple microfrontends simultaneously.

You could run `yarn start` with as many `sources` arguments as you require. For example, to run the biometrics and vitals microfrontends simultaneously, you'd use:

```bash
yarn start --sources 'packages/esm-patient-biometrics-app' --sources 'packages/esm-patient-vitals-app'
```

Alternatively, you could run `yarn serve` from within the individual packages and then use [import map overrides](http://o3-dev.docs.openmrs.org/#/getting_started/setup?id=import-map-overrides).

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

## Configuration

Please see the [Implementer Documentation](https://wiki.openmrs.org/display/projects/3.x+Implementer+Documentation#id-3.xImplementerDocumentation-Part2:ConfigureYourO3Application)
for information about configuring modules.

## Deployment

See the [Frontend Implementer Documentation](https://wiki.openmrs.org/display/projects/Frontend+3.0+Documentation+for+Implementers) for information about adding microfrontends to a distribution.
