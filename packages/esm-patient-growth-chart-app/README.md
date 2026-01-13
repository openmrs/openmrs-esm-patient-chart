# @openmrs/esm-patient-growth-chart-app

## Description
The Growth Chart is designed for the OpenMRS 3.x Patient Chart. Its primary purpose is to allow clinicians to visualize pediatric growth trends (Weight-for-Age, Height-for-Age) against standardized normative curves (WHO & CDC) to identify malnutrition or growth abnormalities early.

## Scope
**Phase 1**
- **Project Initialization**: Scaffolding the app and registering it within the O3 shell.
- **Data Integration**: Fetching Patient Demographics (DOB) and Clinical Observations (Weight, Height).
- **Logic Layer**: Integrating official WHO datasets and implementing Z-score calculation logic.
- **Visualization**: Developing both a Longitudinal Table View and an Interactive Graph View.
- **Quality Assurance**: Implementing E2E testing for the core flows.

## Implementation Plan
- **Architecture**: Built as a micro-frontend within the openmrs-esm-patient-chart monorepo.
- **Tech Stack**: React, TypeScript, Carbon Design System, and Carbon Charts.
- **Data Strategy**: Normative data (WHO/CDC) will be converted from CSV to optimized JSON files stored within the app.

## Current Status
- **Project Initialization**
1.Created the openmrs-esm-growth-chart package structure.
2.Configured the module entry point (index.ts).
3.Registered the "Growth Chart" link in the Patient Chart left navigation bar.
4.Confirmed the skeleton component loads successfully.

- **Data Integration**
1.Patient's Height and Weight observations are fetched from the OpenMRS API.
2.Displayed in a table format.

- **WHO Dataset**
1.Integrated the data set for girls and boys of weight to age who standards. (Birth-5 years).
2.Converted original WHO .xlsx data to JSON format.
3.JSON includes L, M, S parameters for Z-score calculation and P-values for graphing.
4.Link to the WHO data - https://www.who.int/tools/child-growth-standards/standards/weight-for-age

- **Weight for Age Chart**
1.Weight for Age chart is displayed for patients under 5 years of age.
2.If the patient is older than 5 years it will shows and empty state.

- **E2E Testing**
1.Tested the "Growth Chart Unavailable" view for patients older than 5 years.
2.Tested the "Growth Chart Visibility" dashboard for patients younger than 5 years using a dynamic birthdate payload.
3.Tests are deterministic and do not depend on fixed dates.

- **Unit Testing**
1.Testing utility functions (`growth-chart.utils.ts`) that process and format patient weights.
