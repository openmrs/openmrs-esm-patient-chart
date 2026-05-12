import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, test, type Mock } from 'vitest';
import { getDefaultsFromConfigSchema, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../../esm-patient-tests-app/src/config-schema';
import { useOrderableConceptSets } from './useOrderableConceptSets';

const mockOpenrsFetch = openmrsFetch as Mock;
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  orders: {
    labOrderableConcepts: [],
    labOrderTypeUuid: 'lab-order-type-uuid',
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
    const { result } = renderHook(() => useOrderableConceptSets('', ['concept-set-uuid']));
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

  it.skip('should filter through fetched concepts sets based on the search term', async () => {
    const { result } = renderHook(() => useOrderableConceptSets('another', ['concept-set-uuid']));
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
});
