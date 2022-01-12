import { fetchCurrentPatient, getSynchronizationItems } from '@openmrs/esm-framework';
import useSWR, { SWRResponse } from 'swr';

export function usePatient(patientUuid: string): SWRResponse<fhir.Patient, Error> {
  return useSWR(`patient/${patientUuid}`, async () => {
    // const onlinePatient = await fetchCurrentPatient(patientUuid).catch(() => undefined);
    // if (onlinePatient?.data) {
    //   return onlinePatient.data;
    // }

    const offlinePatient = await getOfflineRegisteredPatient(patientUuid);
    if (offlinePatient) {
      return offlinePatient;
    }

    throw new Error('Could neither retrieve an online patient, nor an offline patient.');
  });
}

export async function getOfflineRegisteredPatient(patientUuid: string): Promise<fhir.Patient> {
  const patientRegistrationSyncItems = await getSynchronizationItems<any>('patient-registration');
  const patientSyncItem = patientRegistrationSyncItems.find((item) => item.patientUuid === patientUuid);

  if (!patientSyncItem) {
    return undefined;
  }

  const patient = patientSyncItem.preliminaryPatient;
  // {
  //   uuid: patientUuidMap['patientUuid'],
  //   person: {
  //     uuid: patientUuidMap['patientUuid'],
  //     names: FormManager.getNames(values, patientUuidMap),
  //     gender: values.gender.charAt(0),
  //     birthdate: values.birthdate,
  //     birthdateEstimated: values.birthdateEstimated,
  //     attributes: FormManager.getPatientAttributes(values, personAttributeSections),
  //     addresses: [address],
  //     ...FormManager.getPatientDeathInfo(values),
  //   },
  //   identifiers,
  // };
  const genderMap = {
    M: 'male',
    F: 'female',
    O: 'other',
  };

  const res: fhir.Patient = {
    _id: patient.uuid,
    name: [
      {
        given: [patient.person.names[0].givenName],
        family: patient.person.names[0].familyName,
      },
    ],
    gender: genderMap[patient.person.gender] ?? 'unknown',
    birthDate: patient.person.birthdate,
    address: [
      {
        country: patient.person.addresses[0].country,
        postalCode: patient.person.addresses[0].postalCode,
        state: patient.person.addresses[0].stateProvince,
        city: patient.person.addresses[0].cityVillage,
      },
    ],
    identifier: [],
  };
  return res;
}
