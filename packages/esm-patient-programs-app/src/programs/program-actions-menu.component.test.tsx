import { showModal } from '@openmrs/esm-framework';
import { ProgramsActionsMenu } from './programs-actions-menu.component';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
  useLayoutType: jest.fn(() => 'desktop'),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, defaultText: string) => defaultText }),
}));

describe('ProgramActionsMenu', () => {
  const patientUuid = 'abc';
  const programEnrollmentId = '123';

  it('renders OverflowMenu with edit and delete actions', async () => {
    render(<ProgramsActionsMenu patientUuid={patientUuid} programEnrollmentId={programEnrollmentId} />);

    const overFlowButton = screen.getByRole('button');
    fireEvent.click(overFlowButton);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('launches edit program form when edit button is clicked', () => {
    render(<ProgramsActionsMenu patientUuid={patientUuid} programEnrollmentId={programEnrollmentId} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Edit'));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('programs-form-workspace', { programEnrollmentId });
  });

  it('launches delete program dialog when delete option is clicked', async () => {
    const disposeMock = jest.fn();
    (showModal as jest.Mock).mockReturnValue(disposeMock);

    render(<ProgramsActionsMenu patientUuid={patientUuid} programEnrollmentId={programEnrollmentId} />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Delete'));

    expect(showModal).toHaveBeenCalledWith('program-delete-confirmation-modal', {
      closeDeleteModal: expect.any(Function),
      patientUuid,
      programEnrollmentId,
    });

    /**
     * Simulation for creating the dispose function
     */
    const { closeDeleteModal } = (showModal as jest.Mock).mock.calls[0][1];
    closeDeleteModal();
    expect(disposeMock).toHaveBeenCalled();
  });
});
