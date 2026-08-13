# esm-patient-growth-chart-app

A microfrontend for [OpenMRS 3](https://o3-docs.openmrs.org) that records, displays, and manages clinical growth in the patient chart. It is part of the [openmrs-esm-patient-chart](https://github.com/openmrs/openmrs-esm-patient-chart) monorepo.

Jira: [O3-5331](https://openmrs.atlassian.net/browse/O3-5077)

---

## Features

- **WHO Standard Growth Charts** - Visualizes patient growth (e.g., Weight-for-age) plotted against World Health Organization standard curves.
- **Dynamic Age Filtering** - Automatically displays growth charts for pediatric patients between 0-5 years old, showing a clean empty state message for older patients.
- **Gender-Specific Datasets** - Automatically loads the correct reference dataset (boys vs. girls) based on patient data, and provides an interactive selector for patients with unknown or non-binary genders.
- **Interactive Data Visualization** - Includes interactive tooltips, data point highlighting, and built-in full-screen/export capabilities via Carbon Charts.

---

## Running locally

From the monorepo root:

```bash
yarn start --sources 'packages/esm-patient-growth-chart-app'
```

---

## Related

- Ticket: [O3-5331](https://openmrs.atlassian.net/browse/O3-5077)
- Requirements: [Growth Chart — Confluence](https://openmrs.atlassian.net/wiki/spaces/projects/pages/355401741/O3+Growth+Chart)
- Architecture discussion: [OpenMRS Talk](https://talk.openmrs.org/t/o3-growth-chart/47879)

---

## OpenMRS O3 resources

- [Getting Started](https://o3-docs.openmrs.org/docs/getting-started) - Start here for O3 development
- [Creating a Frontend Module](https://o3-docs.openmrs.org/docs/frontend-modules/creating-a-frontend-module) - Step-by-step guide
- [Framework Concepts](https://o3-docs.openmrs.org/docs/framework-concepts) - Core O3 patterns

---
This module was scaffolded with [`@openmrs/create-o3-app`](https://github.com/openmrs/create-o3-app). The `generator` field in `package.json` records the CLI version that produced it and is safe to remove.
