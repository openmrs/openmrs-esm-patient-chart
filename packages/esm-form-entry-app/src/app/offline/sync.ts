import { getFullSynchronizationItems, queueSynchronizationItem, SyncItem } from '@openmrs/esm-framework';
import { Encounter, EncounterCreate, PersonUpdate } from '../types';

// General note:
// The synchronization handler which actually synchronizes the queued items has been moved to `esm-patient-forms-app`.
// Please see that MFs offline code for the synchronization logic (and for the reason why it's split up in the
// first place...).

export const patientFormSyncItem = 'patient-form';

export interface PatientFormSyncItemContent {
  _id: string;
  formSchemaUuid: string;
  encounter: Partial<Encounter>;
  _payloads: {
    encounterCreate?: EncounterCreate;
    encounterCreates?: Array<EncounterCreate>; // Support for multiple encounters (subforms)
    personUpdate?: PersonUpdate;
  };
}

export async function queuePatientFormSyncItem(content: PatientFormSyncItemContent) {
  await queueSynchronizationItem(patientFormSyncItem, content, {
    id: content._id,
    displayName: 'Patient form',
    patientUuid: content._payloads.encounterCreate?.patient,
    dependencies: [
      {
        type: 'visit',
        id: content._payloads.encounterCreate?.visit,
      },
    ],
  });
}

export async function findQueuedPatientFormSyncItemByContentId(
  id: string,
): Promise<SyncItem<PatientFormSyncItemContent> | undefined> {
  const syncItems = await getFullSynchronizationItems<PatientFormSyncItemContent>(patientFormSyncItem);
  return syncItems.find((item) => item.content._id === id);
}
