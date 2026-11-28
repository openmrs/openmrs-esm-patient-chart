import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { deletePatientAllergy, useAllergies } from './allergy-intolerance.resource';
import DeleteAllergyModal from './delete-allergy.modal';

vi.mock('./allergy-intolerance.resource', () => ({
  deletePatientAllergy: vi.fn(),
  useAllergies: vi.fn(),
}));

const mockDeletePatientAllergy = vi.mocked(deletePatientAllergy);
const mockUseAllergies = vi.mocked(useAllergies);
const mockShowSnackbar = vi.mocked(showSnackbar);

describe('DeleteAllergyModal', () => {
  const mockCloseDeleteModal = vi.fn();
  const mockMutate = vi.fn();
  const allergyId = 'test-allergy-id-123';

  beforeEach(() => {
    mockUseAllergies.mockReturnValue({
      allergies: [],
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: mockMutate,
    });
  });

  it('renders the confirmation prompt and closes without deleting when Cancel is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DeleteAllergyModal closeDeleteModal={mockCloseDeleteModal} allergyId={allergyId} patientUuid={mockPatient.id} />,
    );

    expect(screen.getByRole('heading', { name: /delete allergy/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this allergy\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
    expect(mockDeletePatientAllergy).not.toHaveBeenCalled();
  });

  it('deletes the allergy, revalidates data, closes modal, and shows success snackbar on confirmation', async () => {
    const user = userEvent.setup();
    let resolveDelete: (response: FetchResponse) => void;
    mockDeletePatientAllergy.mockReturnValueOnce(
      new Promise<FetchResponse>((resolve) => {
        resolveDelete = resolve;
      }),
    );

    render(
      <DeleteAllergyModal closeDeleteModal={mockCloseDeleteModal} allergyId={allergyId} patientUuid={mockPatient.id} />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText(/deleting\.\.\./i)).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();

    resolveDelete!({} as FetchResponse);

    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        isLowContrast: true,
        kind: 'success',
        title: 'Allergy deleted',
      }),
    );
    expect(mockDeletePatientAllergy).toHaveBeenCalledWith(mockPatient.id, allergyId, expect.any(AbortController));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockCloseDeleteModal).toHaveBeenCalledTimes(1);
  });

  it('shows an error snackbar and keeps modal open when deletion fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDeletePatientAllergy.mockRejectedValueOnce(new Error('Network error'));

    render(
      <DeleteAllergyModal closeDeleteModal={mockCloseDeleteModal} allergyId={allergyId} patientUuid={mockPatient.id} />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        isLowContrast: false,
        kind: 'error',
        title: 'Error deleting allergy',
        subtitle: 'Network error',
      });
    });

    expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();
    expect(deleteButton).toBeEnabled();

    consoleErrorSpy.mockRestore();
  });

  it('does not call deletePatientAllergy when patientUuid is missing', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<DeleteAllergyModal closeDeleteModal={mockCloseDeleteModal} allergyId={allergyId} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockDeletePatientAllergy).not.toHaveBeenCalled();
    expect(mockCloseDeleteModal).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('DeleteAllergyModal opened without patientUuid');

    consoleErrorSpy.mockRestore();
  });
});
