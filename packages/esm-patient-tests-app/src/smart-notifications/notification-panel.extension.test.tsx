import React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, PatientPhoto, showModal, useConfig } from '@openmrs/esm-framework';
import { mockCriticalSmartNotification, mockSmartNotification } from '__mocks__';
import { mockPatient } from 'tools';
import translations from '../../translations/en.json';
import { configSchema, type ConfigObject } from '../config-schema';
import { smartNotificationDetailModalName } from './constants';
import { _resetReadStore, getReadNotifications, markNotificationRead, setReadUser } from './read-store';
import { useSmartNotifications } from './smart-notifications.resource';
import { useChartPatient } from './use-chart-patient';
import { _resetPanelControls, setNotificationsPanelClose } from './panel-controls';
import NotificationRows from './notification-panel.extension';

vi.mock('./smart-notifications.resource', () => ({ useSmartNotifications: vi.fn() }));
vi.mock('./use-chart-patient', () => ({ useChartPatient: vi.fn() }));

const mockUseSmartNotifications = vi.mocked(useSmartNotifications);
const mockUseChartPatient = vi.mocked(useChartPatient);

const mockShowModal = showModal as Mock;
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

function renderPanel({
  notifications = [mockSmartNotification],
  read = {},
  error = undefined,
  isLoading = false,
}: {
  notifications?: Array<unknown>;
  read?: Record<string, string>;
  error?: Error;
  isLoading?: boolean;
} = {}) {
  mockUseSmartNotifications.mockReturnValue({
    notifications: notifications as never,
    read,
    unreadCount: notifications.length,
    isLoading,
    error,
    mutate: vi.fn(),
  });
  // Read state comes from the store, not a prop, so seed it the way opening a row would.
  setReadUser('user-uuid-1');
  Object.keys(read).forEach((id) => markNotificationRead(id));
  return render(<NotificationRows />);
}

describe('NotificationRows', () => {
  beforeEach(() => {
    localStorage.clear();
    _resetReadStore();
    _resetPanelControls();
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema) } as ConfigObject);
    mockUseChartPatient.mockReturnValue({ patient: mockPatient, patientUuid: mockPatient.id });
    vi.useFakeTimers({ toFake: ['Date'] });
    // Pin "now" a minute after the fixture result so the relative timestamp is stable.
    vi.setSystemTime(new Date('2026-06-29T09:30:30.000Z'));
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

  // The react-i18next test double substitutes placeholders with a plain string replace, so it cannot
  // reproduce the real escaping — units reached the UI as "U&#x2F;L" while these tests stayed green.
  // Asserting on the call is therefore the only guard available at this level.
  it('opts out of i18next escaping for the rows carrying units', async () => {
    const i18next = await import('react-i18next');
    const tSpy = vi.spyOn(i18next.useTranslation(), 't');

    try {
      renderPanel();

      expect(tSpy).toHaveBeenCalledWith(
        'testAndValue',
        '{{test}} — {{value}}',
        expect.objectContaining({ interpolation: { escapeValue: false } }),
      );
      expect(tSpy).toHaveBeenCalledWith(
        'interpretationAndRange',
        '{{interpretation}} · Ref {{range}}',
        expect.objectContaining({ interpolation: { escapeValue: false } }),
      );
    } finally {
      tSpy.mockRestore();
    }
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

  it('draws the row avatar and name from the same patient', () => {
    // Sourcing the name from the chart patient and the photo from the notification would pair one
    // patient's face with another's name. The fixture deliberately disagrees with the chart patient
    // so this fails if the two ever come from different places again.
    renderPanel({ notifications: [{ ...mockSmartNotification, patientUuid: 'some-other-patient-uuid' }] });

    expect(vi.mocked(PatientPhoto).mock.calls[0][0]).toMatchObject({
      patientName: 'John Wilson',
      patientUuid: mockPatient.id,
    });
  });

  it('marks a notification read when its detail is opened', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    setReadUser('user-uuid-1');
    renderPanel();

    expect(getReadNotifications()).toEqual({});

    await user.click(screen.getByRole('button', { name: /serum creatinine/i }));

    expect(getReadNotifications()).toHaveProperty(mockSmartNotification.id);
  });

  it('marks unread rows so they can be told apart from ones already opened', () => {
    renderPanel({
      notifications: [mockSmartNotification, mockCriticalSmartNotification],
      read: { [mockSmartNotification.id]: '2026-06-29T09:30:00.000Z' },
    });

    expect(screen.getByRole('button', { name: /serum creatinine/i })).not.toHaveClass('rowUnread');
    expect(screen.getByRole('button', { name: /haemoglobin/i })).toHaveClass('rowUnread');
  });

  it('keeps a read notification in the list rather than dropping it', () => {
    renderPanel({ read: { [mockSmartNotification.id]: '2026-06-29T09:30:00.000Z' } });

    expect(screen.getByRole('button', { name: /serum creatinine/i })).toBeInTheDocument();
    expect(screen.queryByText('Nothing needs your attention')).not.toBeInTheDocument();
  });

  it('closes the panel through the callback the bell published', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const close = vi.fn();
    // The bell owns togglePanel and publishes this; the rows sit in a different slot.
    setNotificationsPanelClose(close);
    renderPanel();

    await user.click(screen.getByRole('button', { name: /close notifications/i }));

    expect(close).toHaveBeenCalled();
  });

  it('hides the close button when the panel is closed and nothing is published', () => {
    renderPanel();

    expect(screen.queryByRole('button', { name: /close notifications/i })).not.toBeInTheDocument();
  });

  it('renders nothing outside a patient chart', () => {
    mockUseChartPatient.mockReturnValue({ patient: null, patientUuid: null });

    const { container } = renderPanel();

    expect(container).toBeEmptyDOMElement();
  });
});
