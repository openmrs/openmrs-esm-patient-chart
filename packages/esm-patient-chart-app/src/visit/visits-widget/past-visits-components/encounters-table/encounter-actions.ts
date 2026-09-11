import type { TFunction } from 'i18next';
import type { useSWRConfig } from 'swr';
import {
  type Encounter,
  launchWorkspace2,
  type LoggedInUser,
  showModal,
  showSnackbar,
  userHasAccess,
  type Visit,
} from '@openmrs/esm-framework';
import { invalidateVisitAndEncounterData, PRIVILEGE_EDIT_PAST_VISITS } from '@openmrs/esm-patient-common-lib';
import { type ChartConfig } from '../../../../config-schema';
import { rdeEncounterWorkspace, rdeOpenedFrom } from '../../../../constants';
import { deleteEncounter, type MappedEncounter } from './encounters-table.resource';

/**
 * An encounter can be modified by users holding its edit privilege, but only while it is within the
 * configured editable window, unless they hold one of the privileges that overrides that window.
 * Encounters of past (ended) visits additionally require the privilege to edit past visits.
 */
export function canModifyEncounter(
  encounter: MappedEncounter,
  user: LoggedInUser,
  {
    encounterEditableDuration,
    encounterEditableDurationOverridePrivileges,
  }: Pick<ChartConfig, 'encounterEditableDuration' | 'encounterEditableDurationOverridePrivileges'>,
): boolean {
  if (!userHasAccess(encounter.editPrivilege, user)) {
    return false;
  }

  if (encounter.visitStopDatetime && !userHasAccess(PRIVILEGE_EDIT_PAST_VISITS, user)) {
    return false;
  }

  if (encounterEditableDuration === 0) {
    return true;
  }

  const encounterAgeInMinutes = (Date.now() - new Date(encounter.rawDatetime).getTime()) / (1000 * 60);

  return (
    encounterAgeInMinutes <= encounterEditableDuration ||
    encounterEditableDurationOverridePrivileges.some((privilege) => userHasAccess(privilege, user))
  );
}

/**
 * Opens the encounter workspace to edit the specified encounter
 */
export function editEncounter({
  patient,
  encounter,
  visitContext,
  onEncounterSaved,
  additionalProps,
  openedFrom,
}: {
  patient: fhir.Patient;
  /** The visit the encounter belongs to, which is not necessarily the active visit */
  visitContext: Visit;
  encounter: Encounter;
  onEncounterSaved?: (encounter?: Encounter) => void;
  additionalProps?: Record<string, unknown>;
  /**
   * Where the table is rendered from. When set to {@link rdeOpenedFrom}, the RDE page's own copy of the
   * encounter workspace is used, since the chart's belongs to the `patient-chart` workspace group scoped
   * to chart URLs.
   */
  openedFrom?: string;
}) {
  launchWorkspace2(
    openedFrom === rdeOpenedFrom ? rdeEncounterWorkspace : 'encounter-workspace',
    {},
    { patient, patientUuid: patient.id, visitContext, encounter, onEncounterSaved, additionalProps },
  );
}

interface ConfirmAndDeleteEncounterArgs {
  encounterUuid: string;
  encounterTypeName?: string;
  patientUuid: string;
  t: TFunction;
  mutate: ReturnType<typeof useSWRConfig>['mutate'];
  onEncounterDeleted?: (encounter?: Encounter) => void;
}

export function confirmAndDeleteEncounter({
  encounterUuid,
  encounterTypeName,
  patientUuid,
  t,
  mutate,
  onEncounterDeleted,
}: ConfirmAndDeleteEncounterArgs) {
  const dispose = showModal('delete-encounter-modal', {
    close: () => dispose(),
    encounterTypeName: encounterTypeName || '',
    onConfirmation: () => {
      const abortController = new AbortController();
      deleteEncounter(encounterUuid, abortController)
        .then(() => {
          onEncounterDeleted?.({ uuid: encounterUuid } as Encounter);

          // Invalidate visit history and encounter tables since the encounter was deleted
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
