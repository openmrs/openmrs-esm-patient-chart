import { find, groupBy, isUndefined, orderBy } from 'lodash-es';
import {
  type Code,
  type FHIRImmunizationBundle,
  type FHIRImmunizationResource,
  type Reference,
} from '../types/fhir-immunization-domain';
import { type ExistingDoses, type ImmunizationFormData, type ImmunizationGrouped } from '../types';

const mapToImmunizationDoseFromResource = (immunizationResource: FHIRImmunizationResource): ExistingDoses | null => {
  if (!immunizationResource) {
    return null;
  }
  const immunizationObsUuid = immunizationResource?.id;
  const manufacturer = immunizationResource?.manufacturer?.display;
  const lotNumber = immunizationResource?.lotNumber;
  const protocolApplied = immunizationResource?.protocolApplied?.length > 0 && immunizationResource?.protocolApplied[0];
  const doseNumber = protocolApplied?.doseNumberPositiveInt;
  const occurrenceDateTime = immunizationResource?.occurrenceDateTime?.toString();
  const expirationDate = immunizationResource?.expirationDate?.toString();
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

const findCodeWithoutSystem = function (immunizationResource: FHIRImmunizationResource): Code | null {
  if (!immunizationResource?.vaccineCode?.coding) {
    return null;
  }
  return (
    find(immunizationResource.vaccineCode.coding, function (code: Code) {
      return isUndefined(code.system);
    }) || null
  );
};

export const mapFromFHIRImmunizationBundle = (
  immunizationData: FHIRImmunizationBundle | FHIRImmunizationResource[],
): Array<ImmunizationGrouped> => {
  if (!immunizationData) {
    return [];
  }

  let immunizations: FHIRImmunizationResource[] = [];

  if (Array.isArray(immunizationData)) {
    immunizations = immunizationData.filter(
      (item) => item && typeof item === 'object' && item.resourceType === 'Immunization',
    );
  } else if (immunizationData?.entry) {
    immunizations = immunizationData.entry
      .filter((entry) => entry?.resource?.resourceType === 'Immunization')
      .map((entry) => entry.resource);
  }

  if (!immunizations.length) {
    return [];
  }

  const groupByImmunization = groupBy(immunizations, (immunizationResource) => {
    return findCodeWithoutSystem(immunizationResource)?.code;
  });

  const validGroups = Object.entries(groupByImmunization).filter(([key]) => key);

  return validGroups.map(([key, immunizationsForOneVaccine]) => {
    const existingDoses: Array<ExistingDoses> = immunizationsForOneVaccine
      .map(mapToImmunizationDoseFromResource)
      .filter((dose) => dose !== null);

    const codeWithoutSystem = findCodeWithoutSystem(immunizationsForOneVaccine[0]);

    return {
      vaccineName: codeWithoutSystem?.display,
      vaccineUuid: codeWithoutSystem?.code,
      existingDoses: orderBy(existingDoses, [(dose) => dose.occurrenceDateTime], ['desc']),
    };
  });
};

function toReferenceOfType(type: string, referenceValue: string): Reference {
  if (!referenceValue) {
    return null;
  }
  const reference = `${type}/${referenceValue}`;
  return { type, reference };
}

function fromReference(reference: Reference): string | null {
  if (!reference || !reference.reference) {
    return null;
  }
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
