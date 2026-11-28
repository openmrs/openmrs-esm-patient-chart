import { describe, expect, it, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { usePatientListMembers } from './patient-lists.resource';

const mockUseOpenmrsFetchAll = useOpenmrsFetchAll as Mock;
const listUuid = '4dcb7061-fcad-4542-b219-4c197c117050';

const makeMember = (index: number) => ({
  uuid: `membership-${index}`,
  startDate: '2023-11-15T09:03:11.000+0000',
  patient: {
    uuid: `patient-${index}`,
    identifiers: [{ identifier: `ID-${index}` }],
    person: { display: `Patient ${index}`, gender: 'F' },
  },
});

describe('usePatientListMembers', () => {
  it('fetches every page of members of the list', () => {
    mockUseOpenmrsFetchAll.mockReturnValue({ data: [] });

    renderHook(() => usePatientListMembers(listUuid));

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(
      `${restBaseUrl}/cohortm/cohortmember?cohort=${listUuid}&q=&v=full`,
    );
  });

  it('does not fetch anything without a list', () => {
    mockUseOpenmrsFetchAll.mockReturnValue({ data: undefined });

    renderHook(() => usePatientListMembers(undefined));

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(null);
  });

  it('keeps every member, including those beyond the first page', () => {
    // One more member than the REST API returns on a single page by default (50).
    mockUseOpenmrsFetchAll.mockReturnValue({ data: Array.from({ length: 51 }, (_, index) => makeMember(index + 1)) });

    const { result } = renderHook(() => usePatientListMembers(listUuid));

    expect(result.current.listMembers).toHaveLength(51);
    expect(result.current.listMembers[50]).toEqual(
      expect.objectContaining({
        identifier: 'ID-51',
        membershipUuid: 'membership-51',
        name: 'Patient 51',
        patientUuid: 'patient-51',
      }),
    );
  });

  it('stops loading and returns the error when a later page fails', () => {
    const error = new Error('Failed to fetch the second page');
    // What useOpenmrsFetchAll returns when the first page loaded but the next one failed:
    // it still has a page left to fetch, so it keeps reporting that it is loading.
    mockUseOpenmrsFetchAll.mockReturnValue({ data: undefined, error, isLoading: true });

    const { result } = renderHook(() => usePatientListMembers(listUuid));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.listMembers).toEqual([]);
  });
});
