import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import { ProgramsActionMenu } from './programs-action-menu.component';

const mockShowModal = jest.mocked(showModal);
const mockUseLayoutType = jest.mocked(useLayoutType);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
}));

const testProps = {
  programEnrollmentId: '123',
  patientUuid: mockPatient.id,
};

const renderProgramActionsMenu = () => {
  return render(
    <ProgramsActionMenu patientUuid={testProps.patientUuid} programEnrollmentId={testProps.programEnrollmentId} />,
  );
};

describe('ProgramActionsMenu', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop'); // or 'large-desktop' or 'tablet'
  });

  it('renders an overflow menu with edit and delete actions', async () => {
    const user = userEvent.setup();
    renderProgramActionsMenu();

    const overflowMenuButton = screen.getByRole('button', { name: /options/i });
    await user.click(overflowMenuButton);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('launches edit program form when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderProgramActionsMenu();
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Edit'));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('programs-form-workspace', {
      programEnrollmentId: testProps.programEnrollmentId,
      workspaceTitle: 'Edit program enrollment',
    });
  });

  it('launches delete program dialog when delete option is clicked', async () => {
    const user = userEvent.setup();
    renderProgramActionsMenu();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Delete'));

    expect(mockShowModal).toHaveBeenCalledWith('program-delete-confirmation-modal', {
      closeDeleteModal: expect.any(Function),
      patientUuid: testProps.patientUuid,
      programEnrollmentId: testProps.programEnrollmentId,
      size: 'sm',
    });
  });
});
