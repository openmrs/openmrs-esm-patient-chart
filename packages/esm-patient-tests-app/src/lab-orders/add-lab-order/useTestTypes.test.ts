import { useEffect, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { useTestTypes } from './useTestTypes';

jest.mock('swr/immutable');

const mockOpenrsFetch = openmrsFetch as jest.Mock;
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseSWRImmutable = useSWRImmutable as jest.Mock;

mockUseSWRImmutable.mockImplementation((keyFcn: () => any, fetcher: any) => {
  const promise = useRef(fetcher(keyFcn()));
  const [data, setData] = useState(null);

  useEffect(() => {
    promise.current.then((response) => {
      setData(response);
    });
  }, []);

  return { data, isLoading: !data };
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  orders: { labOrderableConcepts: [], labOrderTypeUuid: 'lab-order-type-uuid' },
});

mockOpenrsFetch.mockImplementation((url: string) => {
  if (url.includes('concept?class=Test')) {
    return Promise.resolve({ data: { results: [{ display: 'Test concept' }] } });
  } else if (/.*concept\/[0-9a-f]+.*/.test(url)) {
    return Promise.resolve({ data: { display: 'Orderable set', setMembers: [{ display: 'Configured concept' }] } });
  } else {
    throw Error('Unexpected URL: ' + url);
  }
});

describe('useTestTypes is configurable', () => {
  it('should return all test concepts when no labOrderableConcepts are provided', async () => {
    const { result } = renderHook(() => useTestTypes());
    expect(mockOpenrsFetch).toHaveBeenCalledWith(
      `${restBaseUrl}/concept?class=Test?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.error).toBeFalsy();
    expect(result.current.testTypes).toEqual([expect.objectContaining({ label: 'Test concept' })]);
  });

  it('should return children of labOrderableConcepts when provided', async () => {
    const { result } = renderHook(() => useTestTypes());
    expect(mockOpenrsFetch).toHaveBeenCalledWith(
      expect.stringContaining(
        `${restBaseUrl}/concept?class=Test?v=custom:(display,names:(display),uuid,setMembers:(display,uuid,names:(display),setMembers:(display,uuid,names:(display))))`,
      ),
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.error).toBeFalsy();
    expect(result.current.testTypes).toEqual([
      expect.objectContaining({ conceptUuid: undefined, label: 'Test concept' }),
    ]);
  });
});
