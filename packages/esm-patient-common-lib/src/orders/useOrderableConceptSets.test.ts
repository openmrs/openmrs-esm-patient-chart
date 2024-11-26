import { useEffect, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../../esm-patient-tests-app/src/config-schema';
import { useOrderableConceptSets } from './useOrderableConceptSets';

const mockOpenrsFetch = openmrsFetch as jest.Mock;
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  orders: {
    labOrderableConcepts: [],
    labOrderTypeUuid: 'lab-order-type-uuid',
    labOrderConceptClasses: ['8d4907b2-c2cc-11de-8d13-0010c6dffd0f'],
  },
});

mockOpenrsFetch.mockImplementation((url: string) => {
  if (url.includes('concept?class=concept-class-uuid')) {
    return Promise.resolve({ data: { results: [{ display: 'Test concept' }] } });
  } else if (/.*concept\/[0-9a-f]+.*/.test(url)) {
    return Promise.resolve({
      data: {
        display: 'Orderable set',
        setMembers: [
          { display: 'Configured concept', names: [{ display: 'Configured concept' }], uuid: 'concept-one' },
          {
            display: 'Another configured concept',
            names: [{ display: 'Another configured concept' }],
            uuid: 'concept-two',
          },
        ],
      },
    });
  } else {
    throw Error('Unexpected URL: ' + url);
  }
});

describe('useOrderableConceptSets is configurable', () => {
  it('should fetch orderable concept sets if passed', async () => {
    const { result } = renderHook(() => useOrderableConceptSets('', [], ['concept-set-uuid']));
    expect(openmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/concept/concept-set-uuid?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.concepts).toEqual([
      expect.objectContaining({ display: 'Another configured concept' }),
      expect.objectContaining({ display: 'Configured concept' }),
    ]);
    expect(result.current.error).toBeFalsy();
  });

  xit('should filter through fetched concepts sets based on the search term', async () => {
    const { result } = renderHook(() => useOrderableConceptSets('another', [], ['concept-set-uuid']));
    expect(openmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/concept/concept-set-uuid?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.concepts).toEqual([
      expect.objectContaining({ display: 'Another configured concept' }),
      // expect.objectContaining({ display: 'Configured concept' }),
    ]);
    expect(result.current.error).toBeFalsy();
  });

  it('should fetch concept class if orderable concept set is not passed', async () => {
    const { result } = renderHook(() => useOrderableConceptSets('', ['concept-class-uuid'], []));
    expect(openmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/concept?class=concept-class-uuid&name=&searchType=fuzzy&v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.concepts).toEqual([expect.objectContaining({ display: 'Test concept' })]);
    expect(result.current.error).toBeFalsy();
  });

  it('should fetch concept class if orderable concept set is not passed and search term is passed', async () => {
    const { result } = renderHook(() => useOrderableConceptSets('concept', ['concept-class-uuid'], []));
    expect(openmrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/concept?class=concept-class-uuid&name=concept&searchType=fuzzy&v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.concepts).toEqual([expect.objectContaining({ display: 'Test concept' })]);
    expect(result.current.error).toBeFalsy();
  });
});
