# esm-patient-audit-history-app

A patient-chart microfrontend that surfaces the audit history of an individual
patient. It adds an **Audit History** tab to the patient chart that lists every
recorded change to the patient's record — who changed it, when, the type of
change (created / updated / deleted), and the field-level diff — by talking to
the [`auditlogweb`](https://github.com/openmrs/openmrs-module-auditlogweb)
backend module.

Data comes from `GET /ws/rest/v1/auditlogs/patients?uuid={patientUuid}`, which
returns the patient's Envers revisions (newest first, server-side paginated).
The widget degrades gracefully when the `auditlogweb` module is not installed.

## Running this microfrontend

```sh
yarn start --sources 'packages/esm-patient-audit-history-app'
```
