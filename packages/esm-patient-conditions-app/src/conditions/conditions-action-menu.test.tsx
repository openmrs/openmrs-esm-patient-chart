import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
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
    jest.clearAllMocks();
    mockUseLayoutType.mockReturnValue('small-desktop');
  });

  it('renders an overflow menu with edit and delete actions', async () => {
    const user = userEvent.setup();
    renderConditionsActionMenu();

    const overflowMenuButton = screen.getByRole('button');
    await user.click(overflowMenuButton);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('launches the edit condition form when the Edit menu item is clicked', async () => {
    const user = userEvent.setup();
    renderConditionsActionMenu();

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Edit'));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('conditions-form-workspace', {
      workspaceTitle: 'Edit a Condition',
      condition: mockCondition,
      formContext: 'editing',
    });
  });

  it('opens the delete confirmation modal when the Delete menu item is clicked', async () => {
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

  it('renders with the correct size based on layout type', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    renderConditionsActionMenu();

    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('handles the case when patientUuid is not provided', async () => {
    const user = userEvent.setup();

    render(<ConditionsActionMenu condition={mockCondition} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Delete'));

    expect(mockShowModal).toHaveBeenCalledWith('condition-delete-confirmation-dialog', {
      closeDeleteModal: expect.any(Function),
      conditionId: mockCondition.id,
      patientUuid: undefined,
    });
  });
});
