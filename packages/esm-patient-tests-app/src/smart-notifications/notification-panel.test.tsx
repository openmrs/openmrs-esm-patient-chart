import React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';
import { mockCriticalSmartNotification, mockSmartNotification } from '__mocks__';
import { mockPatient } from 'tools';
import translations from '../../translations/en.json';
import { smartNotificationDetailModalName } from './constants';
import NotificationPanel from './notification-panel.component';

const mockShowModal = showModal as Mock;

function renderPanel(props: Partial<React.ComponentProps<typeof NotificationPanel>> = {}) {
  return render(
    <NotificationPanel
      error={undefined}
      isLoading={false}
      notifications={[mockSmartNotification]}
      onClose={vi.fn()}
      patient={mockPatient}
      {...props}
    />,
  );
}

describe('NotificationPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // Pin "now" a minute after the fixture result so the relative timestamp is stable.
    vi.setSystemTime(new Date('2026-06-29T09:30:30.000Z'));
  });

  it('is announced as a dialog named "Notifications"', () => {
    renderPanel();

    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('summarises how many notifications need review', () => {
    renderPanel({ notifications: [mockSmartNotification, mockCriticalSmartNotification] });

    expect(screen.getByText('2 notifications need review')).toBeInTheDocument();
  });

  // The shared react-i18next test double always renders the default (plural) string, so the
  // singular form can only be verified where i18next actually reads it from at runtime.
  it('ships a grammatical singular form for the count', () => {
    expect(translations.notificationsNeedReview_one).toBe('{{count}} notification needs review');
    expect(translations.notificationsNeedReview_other).toBe('{{count}} notifications need review');
  });

  it('renders the test, value, interpretation and reference range for each row', () => {
    renderPanel();

    expect(screen.getByText('Routine')).toBeInTheDocument();
    expect(screen.getByText('Lab result')).toBeInTheDocument();
    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('Serum creatinine — 1.1 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('Normal · Ref 0.6 – 1.2 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('shows the rejection reason instead of a range for a rejected sample', () => {
    renderPanel({
      notifications: [
        {
          ...mockSmartNotification,
          tag: 'SAMPLE_REJECTED',
          value: undefined,
          rejectionReason: 'Haemolysed sample',
        },
      ],
    });

    expect(screen.getByText('Sample rejected')).toBeInTheDocument();
    expect(screen.getByText('Haemolysed sample')).toBeInTheDocument();
  });

  it('groups rows under a "Requires attention" heading', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: /requires attention/i })).toBeInTheDocument();
  });

  it('explains the smart filtering in the footer', () => {
    renderPanel();

    expect(screen.getByText(/only STAT orders and critical values interrupt you/i)).toBeInTheDocument();
  });

  it('shows an empty state when nothing needs attention', () => {
    renderPanel({ notifications: [] });

    expect(screen.getByText('Nothing needs your attention')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /requires attention/i })).not.toBeInTheDocument();
  });

  it('shows an error state when the notifications could not be loaded', () => {
    renderPanel({ error: new Error('Boom'), notifications: [] });

    expect(screen.getByText("Couldn't load notifications.")).toBeInTheDocument();
  });

  it('opens the detail modal for the clicked row', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPanel({ notifications: [mockSmartNotification, mockCriticalSmartNotification] });

    await user.click(screen.getByRole('button', { name: /haemoglobin/i }));

    expect(mockShowModal).toHaveBeenCalledWith(
      smartNotificationDetailModalName,
      expect.objectContaining({ notification: mockCriticalSmartNotification, patient: mockPatient }),
    );
  });

  it('closes when the close button is used', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onClose = vi.fn();
    renderPanel({ onClose });

    await user.click(screen.getByRole('button', { name: /close notifications/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('moves focus to the dialog on open so it is announced before its controls', () => {
    renderPanel();

    expect(screen.getByRole('dialog', { name: 'Notifications' })).toHaveFocus();
  });
});
