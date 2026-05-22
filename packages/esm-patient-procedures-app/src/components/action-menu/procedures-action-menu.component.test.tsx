import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { launchWorkspace2, showModal, useLayoutType } from '@openmrs/esm-framework';
import { mockProceduresResponse } from '__mocks__';
import { type Procedure } from '../../types';
import { ProceduresActionMenu } from './procedures-action-menu.component';

const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);
const mockShowModal = vi.mocked(showModal);
const mockUseLayoutType = vi.mocked(useLayoutType);

vi.mock('@openmrs/esm-framework', async () => ({
  ...(await vi.importActual('@openmrs/esm-framework')),
  launchWorkspace2: vi.fn(),
  showModal: vi.fn().mockReturnValue(vi.fn()),
  useLayoutType: vi.fn().mockReturnValue('small-desktop'),
}));

const mockProcedure = mockProceduresResponse.results[0] as Procedure;
const patientUuid = '8673ee4f-e2ab-4077-ba55-4980f408773e';

const defaultProps = {
  procedure: mockProcedure,
  patientUuid,
};

function getMenuTrigger() {
  return screen.getByRole('button', { name: /options/i });
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  const trigger = getMenuTrigger();
  await user.click(trigger);
  const panelId = trigger.getAttribute('aria-controls');
  return document.getElementById(panelId!);
}

describe('Procedures Action Menu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockShowModal.mockReturnValue(vi.fn());
  });

  it('renders the overflow menu', () => {
    render(<ProceduresActionMenu {...defaultProps} />);

    expect(getMenuTrigger()).toBeInTheDocument();
  });

  it('renders Edit and Delete menu items after opening the menu', async () => {
    const user = userEvent.setup();
    render(<ProceduresActionMenu {...defaultProps} />);

    const panel = await openMenu(user);

    expect(within(panel!).getByText('Edit')).toBeInTheDocument();
    expect(within(panel!).getByText('Delete')).toBeInTheDocument();
  });

  it('clicking Edit launches the procedures form workspace', async () => {
    const user = userEvent.setup();
    render(<ProceduresActionMenu {...defaultProps} />);

    const panel = await openMenu(user);
    await user.click(within(panel!).getByText('Edit'));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('procedures-form-workspace', {
      procedure: mockProcedure,
      formContext: 'editing',
    });
  });

  it('clicking Delete opens the confirmation modal', async () => {
    const user = userEvent.setup();
    render(<ProceduresActionMenu {...defaultProps} />);

    const panel = await openMenu(user);
    await user.click(within(panel!).getByText('Delete'));

    expect(mockShowModal).toHaveBeenCalledWith(
      'procedure-delete-confirmation-dialog',
      expect.objectContaining({
        procedureUuid: mockProcedure.uuid,
        patientUuid,
      }),
    );
  });

  it('uses lg size on tablet layout', () => {
    mockUseLayoutType.mockReturnValue('tablet');

    render(<ProceduresActionMenu {...defaultProps} />);

    expect(getMenuTrigger()).toHaveClass('cds--overflow-menu--lg');
  });

  it('uses sm size on desktop layout', () => {
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(<ProceduresActionMenu {...defaultProps} />);

    expect(getMenuTrigger()).toHaveClass('cds--overflow-menu--sm');
  });
});
