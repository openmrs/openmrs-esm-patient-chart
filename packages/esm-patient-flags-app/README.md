# esm-patient-flags-app

The O3 patient flags frontend module. Patient flags are visual components that enable healthcare providers to see relevant patient information at a glance in the Patient chart. Flags are displayed in the Patient Summary, just below the section title, and can link users to other areas of the chart to perform relevant actions during a visit.

[Design docs](https://zeroheight.com/23a080e38/p/851fea-patient-flags)

Flags data gets fetched from the Patient Flags API via the `usePatientFlags` hook. The hook returns an array of flags, which can be rendered using the `PatientFlags` component.
