# esm-patient-allergies-app

The allergies widget provides a tabular overview of a patient's recorded allergies as well as workspace forms for recording, editing, and deleting allergies.

## Usage

This module is a patient chart microfrontend that integrates into patient dashboards and workspaces. It includes:

- **Allergies Detailed Summary**: Displays a table of the patient's recorded allergens, categories, reactions, severity levels, and comments, with actions to add, edit, or delete entries.
- **Allergies Overview Extensions**: Provides compact summary views (`allergiesTile` and `allergiesList`) for use on summary dashboards or patient banners.
- **Allergy Form Workspace**: A workspace form (`allergyFormWorkspace`) for recording new allergies or editing existing ones. It also exports `exportedAllergyFormWorkspace` so external apps (such as the ward app) can launch the allergy form within their own workspace window.

## Configuration

### Registered Extensions

This module registers the following extensions in `src/index.ts`:

- `allergiesDashboardLink`: Adds the "Allergies" navigation link to the patient chart side menu.
- `allergiesDetailedSummary`: Main detailed table view for managing patient allergies.
- `allergiesTile`: Compact tile extension for displaying allergy summaries in patient headers or banners.
- `allergiesList`: Compact list extension for displaying active allergies on overview dashboards.
- `allergyFormWorkspace` / `exportedAllergyFormWorkspace`: Form workspace for creating and editing allergy records.
- `deleteAllergyModal`: Confirmation dialog for deleting an allergy record.

### Configuration Schema

Configure the module under `@openmrs/esm-patient-allergies-app` in your implementation's `config.json`:

| Parameter                                | Type          | Description                                                       | Default                                |
| ---------------------------------------- | ------------- | ----------------------------------------------------------------- | -------------------------------------- |
| **`concepts.drugAllergenUuid`**          | `ConceptUuid` | Concept UUID for the drug allergens set.                          | `162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.environmentalAllergenUuid`** | `ConceptUuid` | Concept UUID for the environmental allergens set.                 | `162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.foodAllergenUuid`**          | `ConceptUuid` | Concept UUID for the food allergens set.                          | `162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.mildReactionUuid`**          | `ConceptUuid` | Concept UUID representing mild reaction severity.                 | `1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.moderateReactionUuid`**      | `ConceptUuid` | Concept UUID representing moderate reaction severity.             | `1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.severeReactionUuid`**        | `ConceptUuid` | Concept UUID representing severe reaction severity.               | `1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.allergyReactionUuid`**       | `ConceptUuid` | Concept UUID for the set of allowable allergy reactions.          | `162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |
| **`concepts.otherConceptUuid`**          | `ConceptUuid` | Concept UUID used when "Other" is selected for allergen/reaction. | `5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` |

#### Example Configuration

```json
{
  "@openmrs/esm-patient-allergies-app": {
    "concepts": {
      "drugAllergenUuid": "162552AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "environmentalAllergenUuid": "162554AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "foodAllergenUuid": "162553AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "mildReactionUuid": "1498AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "moderateReactionUuid": "1499AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "severeReactionUuid": "1500AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "allergyReactionUuid": "162555AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "otherConceptUuid": "5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
  }
}