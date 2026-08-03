import type { TFunction } from 'i18next';
import type { useSWRConfig } from 'swr';
import { launchWorkspace2, showModal, showSnackbar } from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData } from '@openmrs/esm-patient-common-lib';
import { deleteEncounter, type MappedEncounter } from './encounters-table.resource';

/**
 * A "Visit Note" encounter created outside of a form is edited through the visit notes workspace
 * rather than the generic form entry workspace.
 */
export function isVisitNoteEncounter(encounter: MappedEncounter): boolean {
  return encounter.encounterType === 'Visit Note' && !encounter.form;
}

/**
 * Opens the appropriate workspace for editing an encounter.
 */
export function launchEditEncounterWorkspace(encounter: MappedEncounter, patientUuid: string) {
  if (isVisitNoteEncounter(encounter)) {
    launchWorkspace2('visit-notes-form-workspace', {
      encounter,
      formContext: 'editing',
      patientUuid,
    });
  } else {
    launchWorkspace2('patient-form-entry-workspace', {
      form: encounter.form,
      encounterUuid: encounter.id,
    });
  }
}

interface ConfirmAndDeleteEncounterArgs {
  encounterUuid: string;
  encounterTypeName?: string;
  patientUuid: string;
  t: TFunction;
  mutate: ReturnType<typeof useSWRConfig>['mutate'];
  mutateVisitContext?: () => void;
}

/**
 * Prompts for confirmation and, once confirmed, deletes the encounter and revalidates the visit and
 * encounter data.
 */
export function confirmAndDeleteEncounter({
  encounterUuid,
  encounterTypeName,
  patientUuid,
  t,
  mutate,
  mutateVisitContext,
}: ConfirmAndDeleteEncounterArgs) {
  const dispose = showModal('delete-encounter-modal', {
    close: () => dispose(),
    encounterTypeName: encounterTypeName || '',
    onConfirmation: () => {
      const abortController = new AbortController();
      deleteEncounter(encounterUuid, abortController)
        .then(() => {
          // Update current visit data for critical components
          mutateVisitContext?.();

          // Also invalidate visit history and encounter tables since the encounter was deleted
          invalidateVisitAndEncounterData(mutate, patientUuid);

          showSnackbar({
            isLowContrast: true,
            title: t('encounterDeleted', 'Encounter deleted'),
            subtitle: t('encounterSuccessfullyDeleted', 'The encounter has been deleted successfully'),
            kind: 'success',
          });
        })
        .catch(() => {
          showSnackbar({
            isLowContrast: false,
            title: t('error', 'Error'),
            subtitle: t(
              'encounterWithError',
              'The encounter could not be deleted successfully. If the error persists, please contact your system administrator.',
            ),
            kind: 'error',
          });
        });
      dispose();
    },
  });
}
