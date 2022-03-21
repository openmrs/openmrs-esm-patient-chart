import { deleteSynchronizationItem, getOfflineDb, queueSynchronizationItem, SyncItem } from '@openmrs/esm-framework';
import { Encounter, EncounterCreate, Person, PersonUpdate } from '../types';

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
  // TODO: This direct sync queue interaction should ideally not happen.
  // We should add a dedicated API to esm-offline here instead.
  // What's missing: A function like `getSynchronizationItems` which returns the *full* item,
  // not just `SyncItem.content`. Then we can leverage the existing API to delete the previous item.
  return (
    await getOfflineDb()
      .syncQueue.filter((syncItem) => syncItem.type === patientFormSyncItem && syncItem.content._id === id)
      .toArray()
  )[0];
}
