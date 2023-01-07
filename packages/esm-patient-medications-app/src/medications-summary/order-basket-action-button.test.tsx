import React from 'react';
import { screen, render, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutType } from '@openmrs/esm-framework';
import {
  launchPatientWorkspace,
  useVisitOrOfflineVisit,
  launchStartVisitPrompt,
} from '@openmrs/esm-patient-common-lib';
import OrderBasketActionButton from './order-basket-action-button.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLayoutType: jest.fn(),
    useStore: jest.fn().mockReturnValue({ items: [{ name: 'order-01', uuid: 'some-uuid' }] }),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useWorkspaces: jest.fn(() => {
      return { workspaces: [{ name: 'order-basket' }] };
    }),
    useVisitOrOfflineVisit: jest.fn(() => ({
      currentVisit: {
        uuid: '8ef90c91-14be-42dd-a1c0-e67fbf904470',
      },
    })),
    launchStartVisitPrompt: jest.fn(),
  };
});

jest.mock('../medications/order-basket-store.ts', () => {
  const originalModule = jest.requireActual('../medications/order-basket-store');

  return {
    ...originalModule,
    orderBasketStore: { items: [{ name: 'order-01', uuid: 'some-uuid' }] },
  };
});

describe('<OrderBasketActionButton/>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  it('should display tablet view action button', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('tablet');

    render(<OrderBasketActionButton />);

    const orderBasketButton = screen.getByRole('button', { name: /Order Basket/i });
    expect(orderBasketButton).toBeInTheDocument();

    await waitFor(() => user.click(orderBasketButton));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket-workspace');
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should display desktop view action button', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('desktop');

    render(<OrderBasketActionButton />);

    const orderBasketButton = screen.getByRole('button', { name: /Medications/i });
    expect(orderBasketButton).toBeInTheDocument();

    await waitFor(() => user.click(orderBasketButton));

    expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket-workspace');
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should prompt user to start visit if no currentVisit found', async () => {
    const user = userEvent.setup();

    mockedUseLayoutType.mockReturnValue('desktop');

    (useVisitOrOfflineVisit as jest.Mock).mockImplementation(() => ({
      currentVisit: null,
    }));

    render(<OrderBasketActionButton />);
    const orderBasketButton = screen.getByRole('button', { name: /Medications/i });
    expect(orderBasketButton).toBeInTheDocument();

    await waitFor(() => user.click(orderBasketButton));

    expect(launchStartVisitPrompt).toHaveBeenCalled();
    expect(launchPatientWorkspace).not.toBeCalled();
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should display a count tag when orders are present on the desktop view', () => {
    mockedUseLayoutType.mockReturnValue('desktop');

    render(<OrderBasketActionButton />);

    expect(screen.getByText(/medications/i)).toBeInTheDocument();
    expect(screen.getByText(/1/i)).toBeInTheDocument();
  });

  it('should display the count tag when orders are present on the tablet view', () => {
    mockedUseLayoutType.mockReturnValue('tablet');

    render(<OrderBasketActionButton />);

    expect(screen.getByRole('button', { name: /1 order basket/i })).toBeInTheDocument();
  });
});
