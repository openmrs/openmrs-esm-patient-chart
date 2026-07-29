import React from 'react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, useOnClickOutside, useSession } from '@openmrs/esm-framework';
import { mockSessionDataResponse, mockSmartNotification, mockCriticalSmartNotification } from '__mocks__';
import { mockPatient } from 'tools';
import { configSchema, type ConfigObject } from '../config-schema';
import { useSmartNotifications } from './smart-notifications.resource';
import { useChartPatient } from './use-chart-patient';
import NotificationBell from './notification-bell.extension';

vi.mock('./smart-notifications.resource', () => ({ useSmartNotifications: vi.fn() }));
vi.mock('./use-chart-patient', () => ({ useChartPatient: vi.fn() }));
vi.mock('./notification-panel.component', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="notification-panel">
      <button onClick={onClose} type="button">
        Panel close
      </button>
    </div>
  ),
}));

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseOnClickOutside = useOnClickOutside as Mock;
const mockUseSession = vi.mocked(useSession);
const mockUseSmartNotifications = vi.mocked(useSmartNotifications);
const mockUseChartPatient = vi.mocked(useChartPatient);

// The framework's test double for useOnClickOutside is a no-op, so swap in a minimal real
// implementation for the tests that exercise dismissal.
const useRealOnClickOutside = <T extends HTMLElement>(handler: (event: MouseEvent) => void, active: boolean) => {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    if (!active) {
      return;
    }
    const listener = (event: MouseEvent) => {
      if (ref.current && event.target instanceof Node && ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    window.addEventListener('mousedown', listener);
    return () => window.removeEventListener('mousedown', listener);
  }, [handler, active]);
  return ref;
};

function mockNotifications(notifications: Array<unknown> = []) {
  mockUseSmartNotifications.mockReturnValue({
    notifications: notifications as never,
    unreadCount: notifications.length,
    isLoading: false,
    error: undefined,
    mutate: vi.fn(),
  });
}

describe('NotificationBell', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    } as ConfigObject);
    mockUseSession.mockReturnValue(mockSessionDataResponse.data);
    mockUseChartPatient.mockReturnValue({ patient: mockPatient, patientUuid: mockPatient.id });
    mockNotifications([]);
  });

  it('renders a bell labelled "Notifications"', () => {
    render(<NotificationBell />);

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows the unread count as a badge', () => {
    mockNotifications([mockSmartNotification, mockCriticalSmartNotification]);

    render(<NotificationBell />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('caps the badge at 9+ so it cannot overflow the header', () => {
    mockNotifications(new Array(12).fill(mockSmartNotification));

    render(<NotificationBell />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('shows no badge when nothing needs attention', () => {
    render(<NotificationBell />);

    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
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

    const { container } = render(<NotificationBell />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not render outside a patient chart', () => {
    mockUseChartPatient.mockReturnValue({ patient: null, patientUuid: null });

    const { container } = render(<NotificationBell />);

    expect(container).toBeEmptyDOMElement();
  });

  it('toggles the panel open and closed on click', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);

    render(<NotificationBell />);
    const bell = screen.getByRole('button', { name: /notifications/i });

    expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
    await user.click(bell);
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
    await user.click(bell);
    expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
  });

  it('closes the panel on Escape', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);

    render(<NotificationBell />);
    await user.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
  });

  it('closes the panel on an outside click', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);
    mockUseOnClickOutside.mockImplementation(useRealOnClickOutside);

    render(
      <div>
        <NotificationBell />
        <button type="button">Outside</button>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: /notifications/i }));
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /outside/i }));

    expect(screen.queryByTestId('notification-panel')).not.toBeInTheDocument();
  });

  it('keeps the panel open when the click lands inside the detail modal', async () => {
    const user = userEvent.setup();
    mockNotifications([mockSmartNotification]);
    mockUseOnClickOutside.mockImplementation(useRealOnClickOutside);

    render(
      <div>
        <NotificationBell />
        <div role="dialog">
          <button type="button">In modal</button>
        </div>
      </div>,
    );
    await user.click(screen.getByRole('button', { name: /notifications/i }));

    await user.click(screen.getByRole('button', { name: /in modal/i }));

    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
  });
});
