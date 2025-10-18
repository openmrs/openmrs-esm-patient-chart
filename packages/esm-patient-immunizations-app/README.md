# esm-patient-immunizations-app

The immunizations widget provides a visual, intuitive system for clinicians to record immunizations, track vaccination schedules, and monitor a patient's vaccination status.

## Usage

This module is a patient chart widget that can be added to any patient chart dashboard. It provides two main views:

1.  **Immunization Summary**: A detailed, collapsible table that groups immunizations by vaccine type. It provides an overview of the patient's vaccination history with expandable rows for more detail.
    From this view, users can add new immunizations or edit/delete existing doses, which launches the immunization workspace form.

2.  **Immunization History**: A separate card that provides a simple, chronological list of all immunizations the patient has received.
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
- **Smart Validation**: Includes checks for future dates and ensures the vaccination date is after the patient's birth date.
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

1.  **Immunizations Dashboard Link (`immunization-summary-dashboard`)**: This extension adds the "Immunizations" link to the patient chart's side navigation menu. It creates a dedicated dashboard page to house the main immunization widgets.

2.  **Immunization Summary Table (`immunization-details-widget`)**: This is the main, collapsible table that groups immunizations by vaccine type. It is placed on the **Immunizations Dashboard** by default.

3.  **Immunization History Card (`immunization-detailed-history-card`)**: This widget displays a simple, chronological list of all immunizations. It is also placed on the **Immunizations Dashboard** by default.

4.  **Immunization Overview Widget (`immunization-overview-widget`)**: This is a small, summary card intended for placement on other dashboards, like the main patient summary. It is **not assigned to a dashboard slot by default**.

To add the overview widget to the patient summary dashboard, add the following to your `extensions.json` configuration:

```json
{
  "name": "immunization-overview-widget",
  "slot": "patient-chart-summary-dashboard-slot",
  "order": 8
}
```


###  Customization Options

The immunizations widget is **fully configurable** to match your implementation’s vaccine setup and scheduling needs.
Configuration is managed through the `configSchema`, which allows you to define:

* Which concept set contains all available vaccines
* Dose and booster schedules for each vaccine

This makes it easy to adapt the widget for different clinical workflows or national immunization programs.

---

### Configurable Parameters Summary

| Parameter                    | Type     | Description                                                                                                                  | Default           |
| ---------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **`immunizationConceptSet`** | `string` | A UUID or concept mapping representing the **concept set** that contains all possible vaccine concepts.                      | `"CIEL:984"`      |
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

---

### Notes

* If `sequenceDefinitions` is **not provided**, vaccines will be treated as **single-dose vaccines** without predefined schedules.
* You can add multiple vaccine definitions as needed to represent your national or local vaccine program.
* **Dose numbering convention**:

  * `1–9` → Primary doses
  * `11–19` → Booster doses
* `sequenceLabel` values are also used as **translation keys** in the UI for localization

## Implementation Checklist

### Required Setup

- [ ] Configure `immunizationConceptSet` to point to your implementation's concept set for vaccines.
- [ ] Configure `sequenceDefinitions` for all vaccines that have a multi-dose or booster schedule.
- [ ] Set user permissions for recording and managing immunizations.

### Optional Customizations

- [ ] Add or modify `sequenceDefinitions` to match local or national immunization programs.
- [ ] Add translations for custom `sequenceLabel` values if supporting multiple languages.

## Key Files for Customization

- **`config-schema.ts`**: Main configuration for vaccine concept sets and dose schedules.
- **`src/widgets/immunizations-summary/immunizations-summary.component.tsx`**: The main component for the immunization summary view.
- **`src/widgets/immunization-history/immunization-history.component.tsx`**: The component for the chronological history view.
- **`src/workspace/immunization-form/immunization-form.component.tsx`**: The workspace form for adding and editing immunizations.