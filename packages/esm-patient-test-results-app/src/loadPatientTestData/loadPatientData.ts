import {
  getEntryConceptClassUuid,
  getUserDataFromCache,
  loadObsEntries,
  loadPresentConcepts,
  extractMetaInformation,
  addUserDataToCache,
} from './helpers';
import { PatientData, ObsRecord, ConceptUuid, ObsUuid, ObsMetaInfo } from '@openmrs/esm-patient-common-lib';

function parseSingleObsData(
  testConceptNameMap: Record<ConceptUuid, string>,
  memberRefs: Record<ObsUuid, [ObsRecord[], number]>,
  metaInfomation: Record<ConceptUuid, ObsMetaInfo>,
) {
  return (entry: ObsRecord) => {
    entry.conceptClass = getEntryConceptClassUuid(entry);

    if (entry.hasMember) {
      // is a panel
      entry.members = new Array(entry.hasMember.length);
      entry.hasMember.forEach((memb, i) => {
        memberRefs[memb.reference.split('/')[1]] = [entry.members, i];
      });
    } else {
      // is a singe test
      entry.meta = metaInfomation[entry.conceptClass];
    }

    if (entry.valueQuantity) {
      entry.value = entry.valueQuantity.value;
      delete entry.valueQuantity;
    }

    entry.name = testConceptNameMap[entry.conceptClass];
  };
}

async function reloadData(patientUuid: string) {
  const entries = await loadObsEntries(patientUuid);
  const allConcepts = await loadPresentConcepts(entries);

  const testConcepts = allConcepts.filter((x) => x.conceptClass.name === 'Test' || x.conceptClass.name === 'LabSet');
  const testConceptUuids: ConceptUuid[] = testConcepts.map((x) => x.uuid);
  const testConceptNameMap: Record<ConceptUuid, string> = Object.fromEntries(
    testConcepts.map(({ uuid, display }) => [uuid, display]),
  );
  const obsByClass: Record<ConceptUuid, ObsRecord[]> = Object.fromEntries(testConceptUuids.map((x) => [x, []]));
  const metaInfomation = extractMetaInformation(testConcepts);

  // obs that are not panels
  const singeEntries: ObsRecord[] = [];

  // a record of observation uuids that are members of panels, mapped to the place where to put them
  const memberRefs: Record<ObsUuid, [ObsRecord[], number]> = {};
  const parseEntry = parseSingleObsData(testConceptNameMap, memberRefs, metaInfomation);

  entries.forEach((entry) => {
    // remove non test entries (due to unclean FHIR reponse)
    if (!testConceptUuids.includes(getEntryConceptClassUuid(entry))) {
      return;
    }

    parseEntry(entry);

    if (entry.members) {
      obsByClass[entry.conceptClass].push(entry);
    } else {
      singeEntries.push(entry);
    }
  });

  singeEntries.forEach((entry) => {
    const { id } = entry;
    const memRef = memberRefs[id];

    if (memRef) {
      memRef[0][memRef[1]] = entry;
    } else {
      obsByClass[entry.conceptClass].push(entry);
    }
  });

  const sortedObs: PatientData = Object.fromEntries(
    Object.entries(obsByClass)
      // remove concepts that did not have any observations
      .filter((x) => x[1].length)
      // replace the uuid key with the display name and sort the observations by date
      .map(([uuid, val]) => {
        const {
          display,
          conceptClass: { display: type },
        } = testConcepts.find((x) => x.uuid === uuid);
        return [
          display,
          {
            entries: val.sort((ent1, ent2) => Date.parse(ent2.effectiveDateTime) - Date.parse(ent1.effectiveDateTime)),
            type,
            uuid,
          },
        ];
      }),
  );

  if (entries.length > 0) {
    addUserDataToCache(patientUuid, sortedObs, entries[0].id);
  }

  return sortedObs;
}

function loadPatientData(patientUuid: string): [PatientData | undefined, Promise<PatientData>] {
  const [cachedPatientData, shouldReload] = getUserDataFromCache(patientUuid);

  return [cachedPatientData, shouldReload.then((reload) => (reload ? reloadData(patientUuid) : cachedPatientData))];
}

export default loadPatientData;
