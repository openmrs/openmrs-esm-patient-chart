:wave:	*New to our project? Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/). You may find the [Map of the Project](https://openmrs.github.io/openmrs-esm-core/#/main/map) especially helpful.* :teacher:	

![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-chart/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Patient Chart

The `openmrs-esm-patient-chart` is a frontend module for the OpenMRS SPA. It bundles together various microfrontends that constitute widgets in a patient dashboard. These widgets include:

- [Allergies](packages/esm-patient-allergies-app/README.md)
- [Appointments](packages/esm-patient-appointments-app/README.md)
- [Attachments](packages/esm-patient-attachments-app/README.md)
- [Biometrics](packages/esm-patient-biometrics-app/README.md)
- [Common lib](packages/esm-patient-common-lib/README.md)
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

## Setup

Check out the developer documentation [here](http://o3-dev.docs.openmrs.org).

This monorepo uses Yarn and Lerna. To start a dev server for a specific microfrontend, run:

```bash
yarn start --sources 'packages/esm-patient-<insert-package-name>-app'
```

This command uses the `openmrs` tooling to fire up a dev server on the default port (`8081`) for the specified microfrontend in addition to `esm-patient-chart-app`.

To start a dev server running all the packages, run:

```bash
yarn start-all
```

Note that this is very resource-intensive. 

The recommended approach for working on multiple microfrontends is to run each one separately on a different port and then use [import map overrides](http://o3-dev.docs.openmrs.org/#/getting_started/setup?id=import-map-overrides). 

For example, to work on the vitals and biometrics widgets simultaneously, you could run:

```bash
yarn start --sources 'packages/esm-patient-vitals-app' --port=8000
```

```bash
yarn start --sources 'packages/esm-patient-biometrics-app' --port=9000
```

These commands would fire up the vitals app on `http://localhost:8001/openmrs-esm-patient-vitals-app` and the biometrics app on `http://localhost:9001/openmrs-esm-patient-biometrics-app`. You can use these import map URLs to override the import maps in your application's import map overrides panel.

## Layout

The patient chart consists of the following parts:

- Navigation menu
- Breadcrumbs menu
- Patient header
- Chart review 
- Workspace
- Side menu

The navigation menu lives on the left side of the screen and provides links to dashboard pages for various widgets in the patient chart.

The breadcrumbs menu gets shown at the top of the page under the navigation bar. It shows the user their current location relative to the information architecture and helps them quickly navigate to a parent level or previous step.

The patient header contains the [patient banner](packages/esm-patient-banner-app/README.md). Uninvasive notifications also appear in this area following actions such as form submissions.

The chart review area is the main part of the screen. It displays all of the widget cards in an easy-to-read layout that is configurable.

The workspace is where data entry takes place. On mobile devices it covers the screen; on desktop it appears in a sidebar.

The side menu provides access to features that do not have their own pages, such as the notifications menu.

## Configuration

Please see the [Implementer Documentation](https://wiki.openmrs.org/display/projects/Frontend+3.0+Documentation+for+Implementers#Frontend3.0DocumentationforImplementers-Configuringtheapplication)
for information about configuring modules.

## Deployment

See the [Frontend Implementer Documentation](https://wiki.openmrs.org/display/projects/Frontend+3.0+Documentation+for+Implementers) for information about adding microfrontends to a distribution.