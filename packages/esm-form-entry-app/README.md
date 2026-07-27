# @openmrs/esm-form-entry-app

`esm-form-entry-app` is an O3 patient chart widget that loads clinical forms
defined using the
[O3 form schema](https://github.com/openmrs/openmrs-contrib-json-schemas/blob/main/form.schema.json),
renders and processes them with the
[Angular Form Engine (`@openmrs/ngx-formentry`)](https://github.com/openmrs/openmrs-ngx-formentry),
and submits the resulting data to OpenMRS.

## Status and availability

The O3 Reference Application ships the
[React Form Engine (`@openmrs/esm-form-engine-lib`)](https://github.com/openmrs/openmrs-esm-form-engine-lib)
by default through `@openmrs/esm-form-engine-app`.

This Angular-based form entry app is retained for implementations that still
depend on the Angular Form Engine and have not yet migrated to the React Form
Engine. It is not included in the
[default Reference Application SPA assembly](https://github.com/openmrs/openmrs-distro-referenceapplication/blob/main/frontend/spa-assemble-config.json).

Implementations using this app must include `@openmrs/esm-form-entry-app` in
their SPA assembly configuration. The Angular and React integrations both
register a form renderer in `form-widget-slot` and should not be enabled
together.

In a Reference Application-based distribution, use the Angular integration by
replacing the React integration in `spa-assemble-config.json`:

```diff
- "@openmrs/esm-form-engine-app": "next",
+ "@openmrs/esm-form-entry-app": "next",
```

Use a version or release tag compatible with the rest of the implementation's
O3 frontend dependencies.

To migrate to the React Form Engine, replace `@openmrs/esm-form-entry-app` with
`@openmrs/esm-form-engine-app`. See the
[React Form Engine migration guidance](https://github.com/openmrs/openmrs-esm-form-engine-lib#production).

## Responsibilities

The widget:

- Retrieves an O3 form definition and its associated OpenMRS form metadata.
- Supplies patient, patient identifier, visit, provider, location, previous
  encounter, and previous observation data to the form.
- Renders the form and supports its validation, conditional rendering,
  calculations, and other form logic.
- Supports creating new encounters and editing existing encounters.
- Converts completed forms into OpenMRS payloads, including observations,
  diagnoses, and orders when specified by the form.
- Submits encounter data and, when applicable, person attribute and patient
  identifier updates.
- Reports loading, validation, and submission results to the surrounding O3
  workspace.

The fields displayed and payloads produced depend on the form definition.

## How it fits into O3

This package is the O3 integration layer for the Angular Form Engine. It
connects the engine to the patient chart, OpenMRS REST APIs, patient and visit
context, workspace lifecycle, configuration, localization, and offline
framework.

It registers the `form-widget` extension in `form-widget-slot`. The surrounding
patient form workspace supplies the patient, form UUID, visit, and optional
encounter context.

This widget handles forms that conform to the O3 form schema. Legacy HTML Form
Entry forms are handled separately by the patient forms application.

## Form definitions

O3 form definitions are JSON documents that conform to the
[O3 form schema](https://github.com/openmrs/openmrs-contrib-json-schemas/blob/main/form.schema.json).

This package renders and processes those definitions. It does not provide form
authoring functionality. Forms can be authored using the
[O3 Form Builder](https://github.com/openmrs/openmrs-esm-form-builder).

## Backend requirements

The widget requires:

- OpenMRS REST Web Services 2.2.0 or later
- The O3 Forms backend module

## Development

From this package directory, start the development server with:

```sh
yarn start
```

Other useful commands:

```sh
yarn build
yarn test
yarn lint
```

## Angular version policy

This app is the Angular part of an otherwise React codebase. It moves together
with
[`openmrs-ngx-formentry`](https://github.com/openmrs/openmrs-ngx-formentry)
and
[`openmrs-ngx-file-uploader`](https://github.com/openmrs/openmrs-ngx-file-uploader).
All three must use the same Angular major version, and that version must remain
supported by Angular through the next Reference Application release.

Before proposing or reviewing an Angular major version bump, read the
[Angular version support policy](https://o3-docs.openmrs.org/en-US/docs/frontend-modules/angular-version-policy).
It explains when to migrate, how to select the target version, and which
toolchain packages must be ready first.
