import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { type Condition } from './conditions.resource';
import { ConditionsActionMenu } from './conditions-action-menu.component';

const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);
const mockShowModal = jest.mocked(showModal);
const mockUseLayoutType = jest.mocked(useLayoutType);

const mockCondition: Condition = {
  clinicalStatus: 'active',
  conceptId: 'test-concept-id',
  display: 'Test Condition',
  onsetDateTime: '2023-01-15',
  recordedDate: '2023-01-15',
  id: 'test-condition-id',
};

const defaultProps = {
  condition: mockCondition,
  patientUuid: 'test-patient-uuid',
};

const renderConditionsActionMenu = () => {
  return render(<ConditionsActionMenu {...defaultProps} />);
};

describe('ConditionsActionMenu', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
  });

  it('renders an action menu button', () => {
    renderConditionsActionMenu();

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('shows menu items only when menu is opened', async () => {
    const user = userEvent.setup();
    renderConditionsActionMenu();

    // Menu items should not be visible initially
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();

    // Open menu
    const menuButton = screen.getByRole('button');
    await user.click(menuButton);

    // Menu items should now be visible
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('opens edit form with the specific condition when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const specificCondition: Condition = {
      clinicalStatus: 'active',
      conceptId: 'hypertension-concept-id',
      display: 'Hypertension',
      onsetDateTime: '2022-03-10',
      recordedDate: '2022-03-10',
      id: 'hypertension-condition-id',
    };

    render(<ConditionsActionMenu condition={specificCondition} patientUuid="patient-123" />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Edit'));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('conditions-form-workspace', {
      workspaceTitle: 'Edit a Condition',
      condition: specificCondition,
      formContext: 'editing',
    });
  });

  it('opens delete confirmation modal with condition ID when Delete button is clicked', async () => {
    const user = userEvent.setup();
    renderConditionsActionMenu();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Delete'));

    expect(mockShowModal).toHaveBeenCalledWith('condition-delete-confirmation-dialog', {
      closeDeleteModal: expect.any(Function),
      conditionId: mockCondition.id,
      patientUuid: defaultProps.patientUuid,
    });
  });
});
