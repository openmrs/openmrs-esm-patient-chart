# OpenMRS ESM Patient Procedures App

Patient procedures microfrontend for the OpenMRS SPA (OMRS-338).

## Features

- Display patient procedure history in a table view
- Record new procedures via form workspace
- Configurable concept UUIDs for procedures and statuses
- Mock data mode for development

## Configuration

This module is designed to be driven by configuration. The default configuration is:

```json
{
  "procedureConceptUuid": "",
  "procedureDateConceptUuid": "",
  "statusConceptUuids": [],
  "useMockData": true
}
```
