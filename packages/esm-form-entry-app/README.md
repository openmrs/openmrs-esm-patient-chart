# esm-form-entry-app

This widget encapsulates the form entry capabilities of the AMPATH form engine. It's essentially a wrapper around an Angular application that renders JSON schemas built using the AMPATH form engine as HTML forms. The user can fill and submit forms and receive success or error notifications upon submission. Read the docs [here](https://ampath-forms.vercel.app).

## Angular version policy

This app is the Angular member of an otherwise React codebase, and it follows the O3 Angular form engine support policy together with [openmrs-ngx-formentry](https://github.com/openmrs/openmrs-ngx-formentry) and [openmrs-ngx-file-uploader](https://github.com/openmrs/openmrs-ngx-file-uploader): all three must stay on the same Angular major, and that major must remain in support through the next RefApp release. Before proposing or reviewing an Angular major version bump, read the [Angular version support policy](https://o3-docs.openmrs.org/en-US/docs/frontend-modules/angular-version-policy), which covers when to migrate, how the target version is chosen, and which toolchain packages gate the migration.
