import { useEffect, useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { renderHook, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { useTestTypes } from './useTestTypes';
import { configSchema } from '../../config-schema';

jest.mock('swr/immutable');

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  restBaseUrl: '/ws/rest/v1',
}));

const mockOpenrsFetch = openmrsFetch as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;
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

describe('useTestTypes is configurable', () => {
  beforeEach(() => {
    mockUseConfig.mockReset();
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockOpenrsFetch.mockReset();
    mockOpenrsFetch.mockImplementation((url: string) => {
      if (url.includes('concept?class=Test')) {
        return Promise.resolve({ data: { results: [{ display: 'Test concept' }] } });
      } else if (/.*concept\/[0-9a-f]+.*/.test(url)) {
        return Promise.resolve({ data: { display: 'Orderable set', setMembers: [{ display: 'Configured concept' }] } });
      } else {
        throw Error('Unexpected URL: ' + url);
      }
    });
    mockUseSWRImmutable.mockClear();
  });

  it('should return all Test concepts when no labOrderableConcepts are provided', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      orders: { labOrderableConcepts: [] },
    });
    const { result } = renderHook(() => useTestTypes());
    expect(mockOpenrsFetch).toHaveBeenCalledWith(
      '/ws/rest/v1/concept?class=Test?v=custom:(display,uuid,setMembers:(display,uuid,setMembers:(display,uuid)))',
    );
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.error).toBeFalsy();
    expect(result.current.testTypes).toEqual([expect.objectContaining({ label: 'Test concept' })]);
  });

  it('should return children of labOrderableConcepts when provided', async () => {
    const { result } = renderHook(() => useTestTypes());
    expect(mockOpenrsFetch).toHaveBeenCalledWith(expect.stringContaining('/ws/rest/v1/concept/'));
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    expect(result.current.error).toBeFalsy();
    expect(result.current.testTypes).toEqual([expect.objectContaining({ label: 'Configured concept' })]);
  });
});
