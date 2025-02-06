import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, showSnackbar } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { deleteProgramEnrollment, useEnrollments } from './programs.resource';
import DeleteProgramModal from './delete-program.modal';

jest.mock('./programs.resource', () => ({
  deleteProgramEnrollment: jest.fn(),
  useEnrollments: jest.fn(),
}));

const mockDeleteProgramEnrollment = jest.mocked(deleteProgramEnrollment);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseEnrollments = jest.mocked(useEnrollments);
const mockMutateEnrollments = jest.fn();

mockUseEnrollments.mockImplementation(
  () =>
    ({
      mutateEnrollments: mockMutateEnrollments,
    }) as unknown as ReturnType<typeof useEnrollments>,
);

const testProps = {
  programEnrollmentId: '123',
  patientUuid: mockPatient.id,
};

const closeDeleteModalMock = jest.fn();

const renderDeleteProgramModal = () => {
  return render(
    <DeleteProgramModal
      closeDeleteModal={closeDeleteModalMock}
      programEnrollmentId={testProps.programEnrollmentId}
      patientUuid={testProps.patientUuid}
    />,
  );
};

describe('DeleteProgramModal', () => {
  it('renders modal with delete confirmation text ', () => {
    renderDeleteProgramModal();

    expect(screen.getByRole('heading', { name: /delete program enrollment/i })).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this program enrollment?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  it('Calls closeDeleteModal when cancel button is clicked', async () => {
    const user = userEvent.setup();

    renderDeleteProgramModal();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(closeDeleteModalMock).toHaveBeenCalled();
  });

  it('clicking the delete button deletes the program enrollment', async () => {
    const user = userEvent.setup();
    mockDeleteProgramEnrollment.mockResolvedValue({ ok: true } as unknown as FetchResponse);

    renderDeleteProgramModal();

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockDeleteProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockDeleteProgramEnrollment).toHaveBeenCalledWith(testProps.programEnrollmentId);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: expect.stringMatching(/program enrollment deleted/i),
    });
  });

  it('renders an error notification when the delete action fails', async () => {
    const user = userEvent.setup();
    mockDeleteProgramEnrollment.mockRejectedValue(new Error('Internal server error'));

    renderDeleteProgramModal();

    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockDeleteProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockDeleteProgramEnrollment).toHaveBeenCalledWith(testProps.programEnrollmentId);
    expect(mockMutateEnrollments).not.toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: expect.stringMatching(/error deleting program enrollment/i),
      subtitle: 'Internal server error',
    });
  });
});
