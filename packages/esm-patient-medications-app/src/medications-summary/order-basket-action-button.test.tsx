import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, useStore } from '@openmrs/esm-framework';
import OrderBasketActionButton from './order-basket-action-button.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;
const mockedUseStore = useStore as jest.Mock;

jest.mock('@openmrs/esm-framework/mock', () => ({
  ...Object(jest.requireActual('@openmrs/esm-framework/mock')),
  useLayoutType: jest.fn(),
  useStore: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
    useWorkspaces: jest.fn(() => {
      return { workspaces: [{ name: 'order-basket' }] };
    }),
  };
});

mockedUseStore.mockImplementation(() => ({ items: [{ name: 'order-01', uuid: 'some-uuid' }] }));

describe('<OrderBasketActionButton/>', () => {
  it('should display tablet view action button', () => {
    mockedUseLayoutType.mockImplementation(() => 'tablet');
    render(<OrderBasketActionButton />);

    const orderBasketButton = screen.getByRole('button', { name: /Order Basket/i });
    expect(orderBasketButton).toBeInTheDocument();
    userEvent.click(orderBasketButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket-workspace');
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should display desktop view action button', () => {
    mockedUseLayoutType.mockImplementation(() => 'desktop');
    render(<OrderBasketActionButton />);

    const orderBasketButton = screen.getByRole('button', { name: /Orders/i });
    expect(orderBasketButton).toBeInTheDocument();
    userEvent.click(orderBasketButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('order-basket-workspace');
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should display the count Tag if order are present on desktop view', () => {
    mockedUseLayoutType.mockImplementation(() => 'desktop');
    // @ts-ignore
    render(<OrderBasketActionButton />);

    expect(screen.getByText(/orders/i)).toBeInTheDocument();
    expect(screen.getByText(/1/i)).toBeInTheDocument();
  });

  it('should display the count Tag if order are present on tablet view', () => {
    mockedUseLayoutType.mockImplementation(() => 'tablet');
    // @ts-ignore
    render(<OrderBasketActionButton />);

    expect(screen.getByRole('button', { name: /1 order basket/i })).toBeInTheDocument();
  });
});
