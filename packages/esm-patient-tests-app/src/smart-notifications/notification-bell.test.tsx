import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { mockSessionDataResponse, mockSmartNotification, mockCriticalSmartNotification } from '__mocks__';
import { mockPatient } from 'tools';
import { configSchema, type ConfigObject } from '../config-schema';
import { notificationsPanelName } from './constants';
import { _resetPanelControls } from './panel-controls';
import { useSmartNotifications } from './smart-notifications.resource';
import { useChartPatient } from './use-chart-patient';
import NotificationBell from './notification-bell.extension';

vi.mock('./smart-notifications.resource', () => ({ useSmartNotifications: vi.fn() }));
vi.mock('./use-chart-patient', () => ({ useChartPatient: vi.fn() }));

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockUseSmartNotifications = vi.mocked(useSmartNotifications);
const mockUseChartPatient = vi.mocked(useChartPatient);

function mockNotifications(notifications: Array<unknown> = [], read: Record<string, string> = {}) {
  mockUseSmartNotifications.mockReturnValue({
    notifications: notifications as never,
    read,
    unreadCount: (notifications as Array<{ id: string }>).filter((notification) => !read[notification.id]).length,
    isLoading: false,
    error: undefined,
    mutate: vi.fn(),
  });
}

/** Stands in for the app shell, which owns which header panel is open. */
function renderBell({ openPanel = null }: { openPanel?: string | null } = {}) {
  const togglePanel = vi.fn();
  const isActivePanel = vi.fn((panelName: string) => panelName === openPanel);
  const view = render(<NotificationBell isActivePanel={isActivePanel} togglePanel={togglePanel} />);
  return { ...view, togglePanel, isActivePanel };
}

describe('NotificationBell', () => {
  beforeEach(() => {
    _resetPanelControls();
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema) } as ConfigObject);
    mockUseSession.mockReturnValue(mockSessionDataResponse.data);
    mockUseChartPatient.mockReturnValue({ patient: mockPatient, patientUuid: mockPatient.id });
    mockNotifications([]);
  });

  it('renders a bell labelled "Notifications"', () => {
    renderBell();

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows the unread count as a badge', () => {
    mockNotifications([mockSmartNotification, mockCriticalSmartNotification]);

    renderBell();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('counts only unread notifications, not everything in the inbox', () => {
    mockNotifications([mockSmartNotification, mockCriticalSmartNotification], {
      [mockSmartNotification.id]: '2026-06-29T09:31:00.000Z',
    });

    renderBell();

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows no badge once every notification has been read', () => {
    mockNotifications([mockSmartNotification], { [mockSmartNotification.id]: '2026-06-29T09:31:00.000Z' });

    renderBell();

    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('caps the badge at 9+ so it cannot overflow the header', () => {
    mockNotifications(new Array(12).fill(0).map((_, index) => ({ ...mockSmartNotification, id: `n-${index}` })));

    renderBell();

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('does not render when smartNotifications is disabled', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      smartNotifications: {
        enabled: false,
        notifyOnAbnormalNonCritical: false,
        locationScoped: true,
        pollingIntervalMs: 30000,
      },
    } as ConfigObject);

    const { container } = renderBell();

    expect(container).toBeEmptyDOMElement();
  });

  it('does not render outside a patient chart', () => {
    mockUseChartPatient.mockReturnValue({ patient: null, patientUuid: null });

    const { container } = renderBell();

    expect(container).toBeEmptyDOMElement();
  });

  it('asks the shell to toggle its notifications panel, rather than rendering one itself', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);

    const { togglePanel } = renderBell();
    await user.click(screen.getByRole('button', { name: /notifications/i }));

    expect(togglePanel).toHaveBeenCalledWith(notificationsPanelName);
  });

  it('reflects the shell as the source of truth for whether the panel is open', () => {
    mockNotifications([mockSmartNotification]);

    renderBell({ openPanel: notificationsPanelName });

    expect(screen.getByRole('button', { name: /notifications/i })).toHaveClass('cds--header__action--active');
  });

  it('closes the panel on Escape while it is open', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);

    const { togglePanel } = renderBell({ openPanel: notificationsPanelName });
    await user.keyboard('{Escape}');

    expect(togglePanel).toHaveBeenCalledWith(notificationsPanelName);
  });

  it('ignores Escape when the panel is already closed', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);

    const { togglePanel } = renderBell();
    await user.keyboard('{Escape}');

    expect(togglePanel).not.toHaveBeenCalled();
  });
});
