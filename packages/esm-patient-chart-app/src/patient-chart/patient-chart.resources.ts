import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import useSWR from 'swr';

const defaultVisitCustomRepresentation =
  'custom:(uuid,display,voided,indication,startDatetime,stopDatetime,' +
  'encounters:(uuid,display,encounterDatetime,' +
  'form:(uuid,name),location:ref,' +
  'encounterType:ref,' +
  'encounterProviders:(uuid,display,' +
  'provider:(uuid,display))),' +
  'patient:(uuid,display),' +
  'visitType:(uuid,name,display),' +
  'attributes:(uuid,display,attributeType:(name,datatypeClassname,uuid),value),' +
  'location:(uuid,name,display))';

export function useVisitByUuId(visitUuid: string, representation: string = defaultVisitCustomRepresentation) {
  const url = `${restBaseUrl}/visit/${visitUuid}?v=${representation}`;

  return useSWR<{ data: Visit }>(visitUuid ? url : null, openmrsFetch);
}
