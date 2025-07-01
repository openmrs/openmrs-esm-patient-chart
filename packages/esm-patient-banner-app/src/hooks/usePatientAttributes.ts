import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { type ConfigObject } from '../config-schema';
import { type Patient } from '../types';

const customRepresentation =
  'custom:(uuid,display,identifiers:(identifier,uuid,preferred,location:(uuid,name),identifierType:(uuid,name,format,formatDescription,validator)),person:(uuid,display,gender,birthdate,dead,age,deathDate,birthdateEstimated,causeOfDeath,preferredName:(uuid,preferred,givenName,middleName,familyName),attributes,preferredAddress:(uuid,preferred,address1,address2,cityVillage,longitude,stateProvince,latitude,country,postalCode,countyDistrict,address3,address4,address5,address6,address7)))';

/**
 * React hook for obtaining patient attributes for a given patient {@link Attribute}
 *
 * If `patientUuid` is null, the hook does nothing.
 *
 * @param patientUuid The patient's UUID
 */
export const usePatientAttributes = (patientUuid: string | null) => {
  const { data, error, isLoading } = useSWRImmutable<{ data: Patient }>(
    patientUuid ? `${restBaseUrl}/patient/${patientUuid}?v=${customRepresentation}` : null,
    openmrsFetch,
  );

  return {
    isLoading,
    attributes: data?.data?.person?.attributes ?? [],
    person: data?.data?.person ?? null,
    error: error,
  };
};

/**
 *  React hook that takes patientUuid {@link string} and return contact details
 *  derived from patient-attributes using configured attributeTypes
 * @param patientUuid Unique patient identifier {@type string}
 * @returns Object containing `contactAttribute` {@link Attribute} loading status
 */
export const usePatientContactAttributes = (patientUuid: string) => {
  const { contactAttributeTypes } = useConfig<ConfigObject>();
  const { attributes, isLoading } = usePatientAttributes(contactAttributeTypes.length ? patientUuid : null);
  const contactAttributes = attributes?.filter(({ attributeType }) =>
    contactAttributeTypes.includes(attributeType?.uuid),
  );
  return {
    contactAttributes: contactAttributes ?? [],
    isLoading,
  };
};
