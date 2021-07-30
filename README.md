![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-chart/workflows/Node.js%20CI/badge.svg)

# OpenMRS ESM Patient Chart

## What is this?

openmrs-esm-patient-chart is a patient dashboard microfrontend for the
OpenMRS SPA. It provides a simple dashboard with cards detailing the
patient's information, such as vitals, demographic and relationships.

## Setup

See the guidance in the [Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/getting_started/setup?id=developing-microfrontends-in-a-lerna-monorepo).
This respository uses Yarn and Lerna.

To start the dev server for a specific package, run

```bash
yarn start packages/esm-patient-<package>-app
```

This will start a dev server for that package as well as `esm-patient-chart-app`.

To start a dev server running all the packages, run

```bash
yarn start-all
```

Note that this is extremely resource-intensive.

## What is the layout of patient chart?

openmrs-esm-patient-chart consists of five parts: patient header, primary navigation, chart review, a workspace, and a right menu.

The patient header contains the patient banner, which displays basic information about the patient,
and patient banner alerts, which sit just below the banner and provide relatively uninvasive reminders.

The primary navigation lives on the left side of the screen, in a slot provided by
[esm-primary-navigation-app](https://github.com/openmrs/openmrs-esm-core/tree/master/packages/apps/esm-primary-navigation-app).
A link is created in that slot for each widget attached to `patient-chart-dashboard-slot`.
It provides access to different parts of the chart review.

The chart review is the main part of the screen, which contains all the widgets.

The workspace is where data entry takes place. On mobile devices it covers the screen; on desktop it appears in a sidebar.

The right menu provides access to features that do not have their own pages, such as the notifications menu.

## How do I configure this module?

Please see the [Implementer Documentation](https://wiki.openmrs.org/display/projects/Frontend+3.0+Documentation+for+Implementers#Frontend3.0DocumentationforImplementers-Configuringtheapplication)
for information about configuring modules.

## Deployment

See the
[Frontend Implementer Documentation](https://wiki.openmrs.org/display/projects/Frontend+3.0+Documentation+for+Implementers)
for information about adding microfrontends to a distribution.
