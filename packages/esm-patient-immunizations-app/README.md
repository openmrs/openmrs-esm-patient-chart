# esm-patient-immunizations-app

The immunizations widget provides a visual, intuitive system for clinicians to record immunizations, track vaccination schedules, and monitor a patient's vaccination status.

## Usage

This module is a patient chart widget that can be added to any patient chart dashboard. It provides two main views:

1. **Immunization Summary**: A detailed, collapsible table that groups immunizations by vaccine type. It provides an overview of the patient's vaccination history with expandable rows for more detail.
   From this view, users can add new immunizations or edit/delete existing doses, which launches the immunization workspace form.

2. **Immunization History**: A separate card that provides a simple, chronological list of all immunizations the patient has received.
   This card, in conjunction with the summary view, helps clinicians track whether a patient's next scheduled dose is upcoming or overdue.

## Key Features

### Enhanced Immunization Form

- **Comprehensive Data Entry**: A workspace form allows for recording new vaccinations with fields for:
  - Vaccination Date
  - Immunization (Vaccine Name)
  - Dose Number
  - Manufacturer
  - Lot Number
  - Expiration Date
  - Next Dose Date
  - Free-text Notes
- **Smart Validation**: Includes checks for future dates and ensures the vaccination date is on or after the patient's birth date.
- **Loading & Error States**: Provides clear user feedback during form submission and validation.

### Detailed Summary & History

- **Grouped Summary Table**: Displays a consolidated list of all vaccine types the patient has received. Each entry shows the vaccine name and details of the most recent dose.
- **Expandable Details**: Users can expand each vaccine entry to see a detailed history for that specific vaccine, including dose number, dates, lot number, manufacturer, notes, and actions.
- **Chronological History Card**: A separate view shows all immunization events sorted by date.

### Next Dose Tracking

- **Visual Indicators**: The system uses visual cues to highlight the status of upcoming vaccinations:
  - 🔴 **Red flag**: Indicates an overdue or currently due vaccination.
  - 🟢 **Green flag**: Indicates an upcoming vaccination.
- **Scheduling Logic**: The `Next Dose Date` field helps clinicians plan future appointments and prevents scheduling errors (e.g., setting a next dose date before the current vaccination date).

### Full Record Management

- **Edit Functionality**: Allows modification of existing immunization records. The form is pre-populated with existing data, and the vaccine name is locked to maintain data integrity.
- **Delete Functionality**: Individual immunization doses can be safely deleted after a confirmation prompt.
- **User Feedback**: Toast notifications confirm the success or failure of create, update, and delete operations.

## Configuration

### Available Widgets

This module registers several extensions that create the complete immunization feature. Here is a breakdown of the key widgets and how they are used:

1. **Immunizations Dashboard Link (`immunization-summary-dashboard`)**: Adds the "Immunizations" link to the patient chart's side navigation menu and automatically creates a dedicated dashboard page for immunization widgets.

2. **Immunization Summary Table (`immunization-details-widget`)**: The main collapsible table that groups immunizations by vaccine type. Automatically placed on the Immunizations Dashboard.

3. **Immunization History Card (`immunization-detailed-history-card`)**: A chronological list of all immunizations. Automatically placed on the Immunizations Dashboard.

4. **Immunization Overview Widget (`immunization-overview-widget`)**: This is a small, summary card intended for placement on other dashboards, like the main patient summary. It is **not assigned to a dashboard slot by default**.

To add the overview widget to the patient summary dashboard, add the following to your `extensions.json` configuration:

```json
{
  "name": "immunization-overview-widget",
  "slot": "patient-chart-summary-dashboard-slot",
  "order": 8
}
```

### Frontend Configuration

Configure the widget by setting values in your implementation's configuration file (typically `config.json` or via the System Administration module). The following parameters are available:

---

### Configurable Parameters Summary

| Parameter                    | Type     | Description                                                                                                                  | Default           |
| ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **`immunizationConceptSet`** | `string` | A UUID or concept mapping (e.g., `"CIEL:984"`) that resolves to a **concept set** containing all available vaccine concepts. | `"CIEL:984"`      |
| **`sequenceDefinitions`**    | `array`  | Defines the **dose and booster schedules** for each vaccine. Each entry represents one vaccine and its sequence definitions. | See example below |

---

### Example Configuration

```json
{
  "immunizationConceptSet": "CIEL:984",
  "sequenceDefinitions": [
    {
      "vaccineConceptUuid": "783AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "sequences": [
        { "sequenceLabel": "Dose-1", "sequenceNumber": 1 },
        { "sequenceLabel": "Dose-2", "sequenceNumber": 2 },
        { "sequenceLabel": "Dose-3", "sequenceNumber": 3 },
        { "sequenceLabel": "Dose-4", "sequenceNumber": 4 },
        { "sequenceLabel": "Booster-1", "sequenceNumber": 11 },
        { "sequenceLabel": "Booster-2", "sequenceNumber": 12 }
      ]
    }
  ]
}
```

**Note**: Replace `vaccineConceptUuid` with your actual vaccine concept UUIDs.

---

### Configuration Notes

- **Dose numbering convention**:
  - `1–9` → Primary doses
  - `11–19` → Booster doses
- If `sequenceDefinitions` is not provided, vaccines are treated as single-dose vaccines without predefined schedules.
- `sequenceLabel` values are used as translation keys in the UI for localization.
- You can add multiple vaccine definitions to represent your national or local immunization program.

## Backend Setup Requirements

The immunizations feature requires backend configuration in the OpenMRS [FHIR2 module](https://github.com/openmrs/openmrs-module-fhir2).

### Required Global Properties

- `fhir2.immunizationsEncounterTypeUuid` - UUID of the encounter type for immunization encounters
- `fhir2.administeringEncounterRoleUuid` - UUID of the encounter role for the administering provider

### Required Concept Mappings

The following CIEL concepts must be mapped:

| CIEL Code | Concept Name | Required |
|-----------|--------------|----------|
| CIEL:1421 | Immunization grouping concept | ✅ Required |
| CIEL:984 | Vaccine | ✅ Required |
| CIEL:1410 | Vaccination date | ✅ Required |
| CIEL:1418 | Dose number | ✅ Required |
| CIEL:1419 | Manufacturer | ✅ Required |
| CIEL:1420 | Lot number | ✅ Required |
| CIEL:165907 | Expiration date | ✅ Required |
| CIEL:161011 | Free text comment | ⚠️ Optional |
| CIEL:170000 | Date next dose | ⚠️ Optional |

## Implementation Checklist

### Backend Setup (Required)

- [ ] Configure global property `fhir2.immunizationsEncounterTypeUuid` with encounter type UUID
- [ ] Configure global property `fhir2.administeringEncounterRoleUuid` with encounter role UUID
- [ ] Verify all required CIEL concept mappings exist (CIEL:1421, CIEL:984, CIEL:1410, CIEL:1418, CIEL:1419, CIEL:1420, CIEL:165907)
- [ ] Verify optional CIEL concept mappings if using notes or next dose date features (CIEL:161011, CIEL:170000)

### Frontend Setup (Required)

- [ ] Configure `immunizationConceptSet` to point to your implementation's concept set for vaccines.
- [ ] Configure `sequenceDefinitions` for all vaccines that have a multi-dose or booster schedule.
- [ ] Set user permissions for recording and managing immunizations.

### Optional Customizations

- [ ] Add or modify `sequenceDefinitions` to match local or national immunization programs.
- [ ] Add translations for custom `sequenceLabel` values if supporting multiple languages.

## Key Files for Customization

- **`src/config-schema.ts`**: Main configuration for vaccine concept sets and dose schedules.
- **`src/immunizations/immunizations-detailed-summary.component.tsx`**: The main component for the immunization summary view.
- **`src/immunizations/immunization-history-dashboard.component.tsx`**: The component for the chronological history view.
- **`src/immunizations/immunizations-form.workspace.tsx`**: The workspace form for adding and editing immunizations.
