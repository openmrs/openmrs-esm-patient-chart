import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { deleteProgramEnrollment, useEnrollments } from './programs.resource';
import DeleteProgramModal from './delete-program.modal';
import { showSnackbar } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';

jest.mock('./programs.resource', () => ({
  deleteProgramEnrollment: jest.fn(),
  useEnrollments: jest.fn(),
}));
jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
  getCoreTranslation: jest.fn((key, defaultText) => defaultText),
}));

const mockMutateEnrollments = jest.fn();
(useEnrollments as jest.Mock).mockImplementation(() => ({ mutateEnrollments: mockMutateEnrollments }));

describe('DeleteProgramModal', () => {
  const closeDeleteModalMock = jest.fn();
  const programEnrollmentId = '123';
  const patientUuid = mockPatient.id;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with delete confirmation text ', () => {
    render(
      <DeleteProgramModal
        closeDeleteModal={closeDeleteModalMock}
        programEnrollmentId={programEnrollmentId}
        patientUuid={patientUuid}
      />,
    );
    expect(screen.getByText('Delete Program Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this program enrollment?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('Calls closeDeleteModal when cancel button is clicked', () => {
    render(
      <DeleteProgramModal
        closeDeleteModal={closeDeleteModalMock}
        programEnrollmentId={programEnrollmentId}
        patientUuid={patientUuid}
      />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(closeDeleteModalMock).toHaveBeenCalled();
  });

  it('handles delete action successfully', async () => {
    (deleteProgramEnrollment as jest.Mock).mockResolvedValue({ ok: true });
    render(
      <DeleteProgramModal
        closeDeleteModal={closeDeleteModalMock}
        programEnrollmentId={programEnrollmentId}
        patientUuid={patientUuid}
      />,
    );
    fireEvent.click(screen.getByText('Confirm'));
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    await screen.findByText('Confirm');
    expect(deleteProgramEnrollment).toHaveBeenCalledWith(programEnrollmentId, expect.any(AbortController));
    expect(mockMutateEnrollments).toHaveBeenCalled();
    expect(closeDeleteModalMock).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Program Enrollment Deleted',
    });
  });

  it('handles delete action error', async () => {
    const errorMessage = 'failed to delete';
    (deleteProgramEnrollment as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(
      <DeleteProgramModal
        closeDeleteModal={closeDeleteModalMock}
        programEnrollmentId={programEnrollmentId}
        patientUuid={patientUuid}
      />,
    );
    fireEvent.click(screen.getByText('Confirm'));
    await screen.findByText('Confirm');

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: 'Error deleting program enrollment',
      subtitle: errorMessage,
    });
  });
});
