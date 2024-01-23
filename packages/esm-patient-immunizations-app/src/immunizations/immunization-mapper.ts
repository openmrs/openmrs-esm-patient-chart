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
  type Reference,
} from '../types/fhir-immunization-domain';
import { type ExistingDoses, type ImmunizationFormData, type ImmunizationGrouped } from '../types';

const mapToImmunizationDose = (immunizationBundleEntry: FHIRImmunizationBundleEntry): ExistingDoses => {
  const immunizationResource = immunizationBundleEntry?.resource;
  const immunizationObsUuid = immunizationResource?.id;
  const manufacturer = immunizationResource?.manufacturer?.display;
  const lotNumber = immunizationResource?.lotNumber;
  const protocolApplied = immunizationResource?.protocolApplied?.length > 0 && immunizationResource?.protocolApplied[0];
  const doseNumber = protocolApplied?.doseNumberPositiveInt;
  const occurrenceDateTime = immunizationResource?.occurrenceDateTime as any as string;
  const expirationDate = immunizationResource?.expirationDate as any as string;
  return {
    immunizationObsUuid,
    manufacturer,
    lotNumber,
    doseNumber,
    occurrenceDateTime,
    expirationDate,
    visitUuid: fromReference(immunizationResource?.encounter),
  };
};

const findCodeWithoutSystem = function (immunizationResource: FHIRImmunizationResource) {
  //Code without system represents internal code using uuid
  return find(immunizationResource?.vaccineCode?.coding, function (code: Code) {
    return isUndefined(code.system);
  });
};

export const mapFromFHIRImmunizationBundle = (
  immunizationBundle: FHIRImmunizationBundle,
): Array<ImmunizationGrouped> => {
  const groupByImmunization = groupBy(immunizationBundle.entry, (immunizationResourceEntry) => {
    return findCodeWithoutSystem(immunizationResourceEntry.resource)?.code;
  });
  return map(groupByImmunization, (immunizationsForOneVaccine: Array<FHIRImmunizationBundleEntry>) => {
    const existingDoses: Array<ExistingDoses> = map(immunizationsForOneVaccine, mapToImmunizationDose);
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

function fromReference(reference: Reference): string {
  return reference.reference.split('/')[1];
}

export const mapToFHIRImmunizationResource = (
  immunizationFormData: ImmunizationFormData,
  visitUuid: string,
  locationUuid: string,
  providerUuid: string,
): FHIRImmunizationResource => {
  return {
    resourceType: 'Immunization',
    status: 'completed',
    id: immunizationFormData.immunizationId,
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
    occurrenceDateTime: immunizationFormData.vaccinationDate,
    expirationDate: immunizationFormData.expirationDate,
    location: toReferenceOfType('Location', locationUuid),
    performer: [{ actor: toReferenceOfType('Practitioner', providerUuid) }],
    manufacturer: { display: immunizationFormData.manufacturer },
    lotNumber: immunizationFormData.lotNumber,
    protocolApplied: [
      {
        doseNumberPositiveInt: immunizationFormData.doseNumber,
        series: null, // the backend currently does not support "series"
      },
    ],
  };
};
