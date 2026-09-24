import React from 'react';
import { vi, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import StartVisitDialog from './start-visit-dialog.modal';

const defaultProps = {
  patientUuid: 'some-uuid',
  closeModal: vi.fn(),
  visitType: null,
};

const mockLaunchWorkspace = vi.mocked(launchWorkspace2);

describe('StartVisit', () => {
  test('should launch start visit form', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onVisitStarted = vi.fn();

    renderStartVisitDialog({ onCancel, onVisitStarted });

    expect(
      screen.getByText(
        `You can't add data to the patient chart without an active visit. Would you like to start a new visit?`,
      ),
    ).toBeInTheDocument();

    const startNewVisitButton = screen.getByRole('button', { name: /Start new visit/i });

    await user.click(startNewVisitButton);

    expect(mockLaunchWorkspace).toHaveBeenCalledWith('start-visit-workspace-form', {
      openedFrom: 'patient-chart-start-visit',
      onVisitStarted,
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(defaultProps.closeModal).toHaveBeenCalled();
  });

  test.each([/cancel/i, /close/i])('should report cancellation using the %s button', async (name) => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const closeModal = vi.fn();
    renderStartVisitDialog({ onCancel, closeModal });

    await user.click(screen.getByRole('button', { name }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(closeModal).not.toHaveBeenCalled();
  });

  test('should fall back to closing when no cancellation callback is supplied', async () => {
    const user = userEvent.setup();
    const closeModal = vi.fn();
    renderStartVisitDialog({ closeModal });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(closeModal).toHaveBeenCalledOnce();
  });
});

function renderStartVisitDialog(props = {}) {
  render(<StartVisitDialog {...defaultProps} {...props} />);
}
