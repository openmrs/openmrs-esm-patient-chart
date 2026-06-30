import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, type Mock } from 'vitest';
import useSWR from 'swr';
import { usePatientAuditHistory } from './audit-history.resource';

vi.mock('swr');

const mockUseSWR = useSWR as unknown as Mock;

describe('usePatientAuditHistory', () => {
  it('builds the patient audit URL and maps the response', () => {
    const response = {
      data: {
        totalLogs: 2,
        currentPage: 0,
        totalPages: 1,
        logs: [{ revisionID: 1 }, { revisionID: 2 }],
      },
    };
    mockUseSWR.mockReturnValue({
      data: response,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => usePatientAuditHistory('abc-123', 0, 10));

    expect(mockUseSWR.mock.calls[0][0]).toContain('/auditlogs/patients?uuid=abc-123&page=0&size=10');
    expect(result.current.logs).toHaveLength(2);
    expect(result.current.totalLogs).toBe(2);
    expect(result.current.totalPages).toBe(1);
  });

  it('passes a null SWR key when there is no patient uuid (so no request is made)', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderHook(() => usePatientAuditHistory('', 0, 10));

    expect(mockUseSWR.mock.calls[0][0]).toBeNull();
  });

  it('returns safe defaults while data is undefined', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => usePatientAuditHistory('abc-123', 0, 10));

    expect(result.current.logs).toEqual([]);
    expect(result.current.totalLogs).toBe(0);
    expect(result.current.isLoading).toBe(true);
  });
});
