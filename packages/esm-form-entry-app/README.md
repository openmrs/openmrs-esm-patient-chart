# esm-form-entry-app

This widget encapsulates the form entry capabilities of the AMPATH form engine. It's essentially a wrapper around an Angular application that renders JSON schemas built using the AMPATH form engine as HTML forms. The user can fill and submit forms and receive success or error notifications upon submission. Read the docs [here](https://ampath-forms.vercel.app).

## Angular version policy

This app is the Angular part of an otherwise React codebase. It moves together with [openmrs-ngx-formentry](https://github.com/openmrs/openmrs-ngx-formentry) and [openmrs-ngx-file-uploader](https://github.com/openmrs/openmrs-ngx-file-uploader): all three must use the same Angular major version, and that version must still be supported by Angular through the next RefApp release. Before proposing or reviewing an Angular major version bump, read the [Angular version support policy](https://o3-docs.openmrs.org/en-US/docs/frontend-modules/angular-version-policy). It explains when to migrate, how to pick the target version, and which toolchain packages must be ready first.
