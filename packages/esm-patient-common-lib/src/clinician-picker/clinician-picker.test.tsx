import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOpenmrsFetchAll, userHasAccess } from '@openmrs/esm-framework';
import { PRIVILEGE_EDIT_ENCOUNTERS_ON_BEHALF_OF_OTHERS } from '../privileges';
import { ClinicianPicker } from './clinician-picker.component';

const mockUserHasAccess = vi.mocked(userHasAccess);
const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);

const providers = [
  { uuid: 'provider-b', person: { display: 'Beta Clinician' } },
  { uuid: 'provider-a', person: { display: 'Alpha Clinician' } },
];

describe('ClinicianPicker', () => {
  beforeEach(() => {
    mockUserHasAccess.mockImplementation((privilege) => privilege === PRIVILEGE_EDIT_ENCOUNTERS_ON_BEHALF_OF_OTHERS);
    mockUseOpenmrsFetchAll.mockReturnValue({ data: providers, isLoading: false, error: undefined } as any);
  });

  it('renders nothing without the on-behalf privilege', () => {
    mockUserHasAccess.mockReturnValue(false);
    render(<ClinicianPicker value={null} onChange={vi.fn()} />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    // no providers are fetched either
    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(null);
  });

  it('limits the fetched providers to the given roles', () => {
    render(<ClinicianPicker value={null} onChange={vi.fn()} providerRoles={['role-1', 'role-2']} />);

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(expect.stringContaining('providerRoles=role-1,role-2'));
  });

  it('fetches all providers when no roles are given', () => {
    render(<ClinicianPicker value={null} onChange={vi.fn()} />);

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(expect.not.stringContaining('providerRoles'));
  });

  it('lets the user pick a clinician', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ClinicianPicker value={null} onChange={onChange} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByText('Alpha Clinician'));

    expect(onChange).toHaveBeenCalledWith(providers[1]);
  });

  it('shows a warning when the clinicians cannot be loaded', () => {
    mockUseOpenmrsFetchAll.mockReturnValue({ data: undefined, isLoading: false, error: new Error('boom') } as any);
    render(<ClinicianPicker value={null} onChange={vi.fn()} />);

    expect(screen.getByText(/error occurred while loading clinicians/i)).toBeInTheDocument();
  });
});
