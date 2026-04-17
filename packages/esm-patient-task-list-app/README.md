# OpenMRS ESM Patient Task List

![CI](https://github.com/openmrs/openmrs-esm-patient-chart/workflows/OpenMRS%20CI/badge.svg)

This frontend module provides task management features for OpenMRS 3, allowing healthcare providers to create, view, and manage patient tasks directly from the patient chart.

## Requirements

This module requires the [Tasks backend module](https://github.com/openmrs/openmrs-module-tasks) to be installed in your OpenMRS distribution.

## Running this code

```sh
yarn  # to install dependencies
yarn start  # to run the dev server
```

## Usage

The task management features appear in the O3 Patient Chart. You'll see a new icon in the Action Menu (right sidebar on desktop, bottom bar on tablet) that opens the task list workspace.

From the task list, you can:

- View all tasks for the current patient
- Click on a task to see its details
- Create new tasks
- Mark tasks as complete or incomplete
- Delete tasks
