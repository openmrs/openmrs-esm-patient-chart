import find from 'lodash-es/find';
import get from 'lodash-es/get';
import groupBy from 'lodash-es/groupBy';
import isUndefined from 'lodash-es/isUndefined';
import map from 'lodash-es/map';
import orderBy from 'lodash-es/orderBy';
import dayjs from 'dayjs';
import {
  Code,
  FHIRImmunizationBundle,
  FHIRImmunizationBundleEntry,
  FHIRImmunizationResource,
  ImmunizationData,
  ImmunizationDoseData,
  ImmunizationFormData,
  Reference,
} from './immunization-domain';

const mapToImmunizationDose = (immunizationBundleEntry: FHIRImmunizationBundleEntry): ImmunizationDoseData => {
  const immunizationResource = immunizationBundleEntry?.resource;
  const immunizationObsUuid = immunizationResource?.id;
  const manufacturer = immunizationResource?.manufacturer?.display;
  const lotNumber = immunizationResource?.lotNumber;
  const protocolApplied = immunizationResource?.protocolApplied?.length > 0 && immunizationResource?.protocolApplied[0];
  const sequenceLabel = protocolApplied?.series;
  const sequenceNumber = protocolApplied?.doseNumberPositiveInt;
  const occurrenceDateTime = dayjs(immunizationResource?.occurrenceDateTime).format('YYYY-MM-DD');
  const expirationDate = dayjs(immunizationResource?.expirationDate).format('YYYY-MM-DD');

  return {
    immunizationObsUuid,
    manufacturer,
    lotNumber,
    sequenceLabel,
    sequenceNumber,
    occurrenceDateTime,
    expirationDate,
  };
};

const findCodeWithoutSystem = function (immunizationResource: FHIRImmunizationResource) {
  //Code without system represents internal code using uuid
  return find(immunizationResource?.vaccineCode?.coding, function (code: Code) {
    return isUndefined(code.system);
  });
};

export const mapFromFHIRImmunizationBundle = (immunizationBundle: FHIRImmunizationBundle): Array<ImmunizationData> => {
  const groupByImmunization = groupBy(immunizationBundle.entry, (immunizationResourceEntry) => {
    return findCodeWithoutSystem(immunizationResourceEntry.resource)?.code;
  });
  return map(groupByImmunization, (immunizationsForOneVaccine: Array<FHIRImmunizationBundleEntry>) => {
    const existingDoses: Array<ImmunizationDoseData> = map(immunizationsForOneVaccine, mapToImmunizationDose);
    const codeWithoutSystem = findCodeWithoutSystem(immunizationsForOneVaccine[0]?.resource);

    return {
      vaccineName: codeWithoutSystem.display,
      vaccineUuid: codeWithoutSystem.code,
      existingDoses: orderBy(existingDoses, [(dose) => get(dose, 'occurrenceDateTime')], ['desc']),
    };
  });
};

function toReferenceOfType(type: string, referenceValue: string): Reference {
  const reference = `${type}/${referenceValue}`;
  return { type, reference };
}

export const mapToFHIRImmunizationResource = (
  immunizationForData: ImmunizationFormData,
  visitUuid,
  locationUuid,
  providerUuid,
): FHIRImmunizationResource => {
  return {
    resourceType: 'Immunization',
    status: 'completed',
    id: immunizationForData.immunizationObsUuid,
    vaccineCode: {
      coding: [
        {
          code: immunizationForData.vaccineUuid,
          display: immunizationForData.vaccineName,
        },
      ],
    },
    patient: toReferenceOfType('Patient', immunizationForData.patientUuid),
    encounter: toReferenceOfType('Encounter', visitUuid), //Reference of visit instead of encounter
    occurrenceDateTime: dayjs(immunizationForData.vaccinationDate).toDate(),
    expirationDate: dayjs(immunizationForData.expirationDate).toDate(),
    location: toReferenceOfType('Location', locationUuid),
    performer: [{ actor: toReferenceOfType('Practitioner', providerUuid) }],
    manufacturer: { display: immunizationForData.manufacturer },
    lotNumber: immunizationForData.lotNumber,
    protocolApplied: [
      {
        doseNumberPositiveInt: immunizationForData.currentDose.sequenceNumber,
        series: immunizationForData.currentDose.sequenceLabel,
      },
    ],
  };
};
