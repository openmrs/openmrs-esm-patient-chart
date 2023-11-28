import { formatDate, parseDate } from '@openmrs/esm-framework';
import find from 'lodash-es/find';
import get from 'lodash-es/get';
import groupBy from 'lodash-es/groupBy';
import isUndefined from 'lodash-es/isUndefined';
import map from 'lodash-es/map';
import orderBy from 'lodash-es/orderBy';
import {
  type Code,
  type FHIRImmunizationBundle,
  type FHIRImmunizationBundleEntry,
  type FHIRImmunizationResource,
  type ImmunizationData,
  type ImmunizationDoseData,
  type ImmunizationFormData,
  type Reference,
} from './immunization-domain';

const mapToImmunizationDose = (immunizationBundleEntry: FHIRImmunizationBundleEntry): ImmunizationDoseData => {
  const immunizationResource = immunizationBundleEntry?.resource;
  const immunizationObsUuid = immunizationResource?.id;
  const manufacturer = immunizationResource?.manufacturer?.display;
  const lotNumber = immunizationResource?.lotNumber;
  const protocolApplied = immunizationResource?.protocolApplied?.length > 0 && immunizationResource?.protocolApplied[0];
  const sequenceLabel = protocolApplied?.series;
  const sequenceNumber = protocolApplied?.doseNumberPositiveInt;
  const occurrenceDateTime = formatDate(new Date(immunizationResource?.occurrenceDateTime));
  const expirationDate = formatDate(new Date(immunizationResource?.expirationDate));

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
      vaccineName: codeWithoutSystem?.display,
      vaccineUuid: codeWithoutSystem?.code,
      existingDoses: orderBy(existingDoses, [(dose) => get(dose, 'occurrenceDateTime')], ['desc']),
    };
  });
};

function toReferenceOfType(type: string, referenceValue: string): Reference {
  const reference = `${type}/${referenceValue}`;
  return { type, reference };
}

export const mapToFHIRImmunizationResource = (
  immunizationFormData: ImmunizationFormData,
  visitUuid,
  locationUuid,
  providerUuid,
): FHIRImmunizationResource => {
  return {
    resourceType: 'Immunization',
    status: 'completed',
    id: immunizationFormData.immunizationObsUuid,
    vaccineCode: {
      coding: [
        {
          code: immunizationFormData.vaccineUuid,
          display: immunizationFormData.vaccineName,
        },
      ],
    },
    patient: toReferenceOfType('Patient', immunizationFormData.patientUuid),
    encounter: toReferenceOfType('Encounter', visitUuid), //Reference of visit instead of encounter
    occurrenceDateTime: parseDate(immunizationFormData.vaccinationDate),
    expirationDate: parseDate(immunizationFormData.expirationDate),
    location: toReferenceOfType('Location', locationUuid),
    performer: [{ actor: toReferenceOfType('Practitioner', providerUuid) }],
    manufacturer: { display: immunizationFormData.manufacturer },
    lotNumber: immunizationFormData.lotNumber,
    protocolApplied: [
      {
        doseNumberPositiveInt: immunizationFormData.currentDose.sequenceNumber,
        series: immunizationFormData.currentDose.sequenceLabel,
      },
    ],
  };
};
