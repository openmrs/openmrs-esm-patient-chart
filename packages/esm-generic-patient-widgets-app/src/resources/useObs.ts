import useSWR from 'swr';
import { openmrsFetch, fhirBaseUrl, useConfig, FHIRResource } from '@openmrs/esm-framework';

export const pageSize = 100;

export function useObs(patientUuid: string): UseObsResult {
  const { data } = useConfig();

  // const restBaseUrl = '/ws/rest/v1/';
  // let conceptDataTypes = [];
  const {
    data: result,
    error,
    isValidating,
  } = useSWR<{ data: ObsFetchResponse }, Error>(
    `${fhirBaseUrl}/Observation?subject:Patient=${patientUuid}&code=` +
      data.map((d) => d.concept).join(',') +
      '&_summary=data&_sort=-date' +
      `&_count=${pageSize}
  `,
    openmrsFetch,
  );

  //Buscar conceito para a resposta

  const observations =
    result?.data?.entry?.map((entry) => {
      let dataEntry: any = {};

      switch (true) {
        case entry.resource.hasOwnProperty('valueString'):
          dataEntry = {
            ...entry.resource,
            conceptUuid: entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code,
            dataType: 'Text',
          };
          break;

        case entry.resource.hasOwnProperty('valueQuantity'):
          dataEntry = {
            ...entry.resource,
            conceptUuid: entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code,
            dataType: 'Number',
          };
          break;

        case entry.resource.hasOwnProperty('valueCodeableConcept'):
          dataEntry = {
            ...entry.resource,
            conceptUuid: entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code,
            dataType: 'Coded',
          };
          break;
      }

      return dataEntry;
    }) ?? [];

  /* Try to access thow openmrs/ws/rest/v1/concept/{uuid}
  // data.map(async (item) => {
  //   // ('http://localhost:8080/openmrs/ws/rest/v1/concept/b8a853bf-80a3-4344-a730-fd6c46165014?v=full');
  //   await openmrsFetch(`/ws/rest/v1/concept/${item.concept}?v=full`)
  //     .then((result) => {
  //       conceptDataTypes.push({ uuid: item.concept, dataType: result.data?.datatype?.name });
  //       console.log('aqui0');
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // });

  // const observations =
  //   result?.data?.entry?.map((entry) => {
  //     const conceptUUID: string = entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code;
  //     console.log('aqui1');
  //     // const conceptDataType = getConceptTypeByConceptId(conceptUUID);
  //     console.log('observations', conceptDataTypes);

  //     return {
  //       // dataType: conceptDataType,
  //       // dataType: conceptDataType[conceptUUID],
  //       ...entry.resource,
  //       conceptUuid: entry.resource.code.coding.filter((c) => isUuid(c.code))[0]?.code,
  //     };
  //   }) ?? [];
  */

  return {
    data: observations,
    error: error,
    isLoading: !result && !error,
    isValidating,
  };
}

interface ObsFetchResponse {
  entry: Array<{
    resource: FHIRResource['resource'];
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

export interface UseObsResult {
  data: Array<ObsResult>;
  error: Error;
  isLoading: boolean;
  isValidating: boolean;
}

type ObsResult = FHIRResource['resource'] & {
  conceptUuid: string;
  dataType: string;
  valueString?: string;
  valueCodeableConcept?: ObsCodedData;
};

type ObsCodedData = {
  coding: Array<ObsCodedCodingData>;
};

type ObsCodedCodingData = {
  code: string;
  display: string;
};

function isUuid(input: string) {
  return input.length === 36;
}
