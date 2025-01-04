import { showModal, useLayoutType } from '@openmrs/esm-framework';
import { ProgramsActionsMenu } from './programs-actions-menu.component';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import userEvent from '@testing-library/user-event';

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
  useLayoutType: jest.fn(() => 'desktop'),
  getCoreTranslation: jest.fn((key, defaultText) => defaultText),
}));

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
    <ProgramsActionsMenu patientUuid={testProps.patientUuid} programEnrollmentId={testProps.programEnrollmentId} />,
  );
};

describe('ProgramActionsMenu', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop'); // or 'large-desktop' or 'tablet'
  });

  it('renders OverflowMenu with edit and delete actions', async () => {
    const user = userEvent.setup();
    renderProgramActionsMenu();

    const overFlowButton = screen.getByRole('button');
    await user.click(overFlowButton);

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
    });
  });
});
