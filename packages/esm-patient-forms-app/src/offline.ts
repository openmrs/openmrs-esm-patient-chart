import { openmrsFetch, setupOfflineSync, SyncProcessOptions, Visit } from '@openmrs/esm-framework';
import { launchFormEntry } from './form-entry-interop';

// General note on the following imports and this file in general:
// Yes, the imports below are super super dirty.
// In fact, the entire content of this file should ideally live inside the `esm-form-entry-app` package.
// The reason for putting it in here (and doing these nasty imports) is that the code here requires
// functions from `esm-patient-common-lib`.
// The issue is integrating that lib in the `esm-form-entry-app` package while also making the build
// work. Trust me, I tried. But by now, I don't want to waste any more time on this issue when this
// workaround here exists.
// If anyone reading this comment wants to take on the challenge, please feel
// free to do so and, if successful, notify me when `launchPatientWorkspace` can be called
// from `esm-form-entry-app` and/or directly migrate this file's content to the appropriate location.
import type { PatientFormSyncItemContent } from '../../esm-form-entry-app/src/app/offline/sync';
import type { EncounterCreate } from '../../esm-form-entry-app/src/app/types';

const patientFormSyncItem = 'patient-form';

export async function setupPatientFormSync() {
  setupOfflineSync<PatientFormSyncItemContent>(patientFormSyncItem, ['visit'], syncPatientForm, {
    onBeginEditSyncItem(syncItem) {
      // @ts-ignore
      launchFormEntry(syncItem.content.formSchemaUuid, undefined, syncItem.content._id, 'Mock Form Name');
    },
  });
}

async function syncPatientForm(
  item: PatientFormSyncItemContent,
  options: SyncProcessOptions<PatientFormSyncItemContent>,
) {
  const associatedOfflineVisit: Visit | undefined = options.dependencies[0];
  const {
    _payloads: { encounterCreate, personUpdate },
  } = item;

  await Promise.all([
    syncEncounter(associatedOfflineVisit, encounterCreate),
    syncPersonUpdate(personUpdate?.uuid, personUpdate),
  ]);
}

async function syncEncounter(associatedOfflineVisit: Visit, encounter?: EncounterCreate) {
  if (!encounter) {
    return;
  }

  const body = {
    ...encounter,
    encounterDatetime: encounter.encounterDatetime ?? associatedOfflineVisit?.stopDatetime,
  };

  await openmrsFetch('/ws/rest/v1/encounter', {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body,
  });
}

async function syncPersonUpdate(personUuid?: string, personUpdate?: any) {
  if (!personUuid || !personUpdate) {
    return;
  }

  await openmrsFetch(`/ws/rest/v1/person/${personUuid}`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: personUpdate,
  });
}
