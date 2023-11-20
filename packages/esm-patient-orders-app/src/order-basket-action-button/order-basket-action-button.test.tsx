import React from 'react';
import { screen, render, waitFor, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLayoutType, usePatient } from '@openmrs/esm-framework';
import { OrderBasketItem, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../tools/test-helpers';
import OrderBasketActionButton from './order-basket-action-button.extension';
import { orderBasketStore } from '@openmrs/esm-patient-common-lib/src/orders/store';

const mockedUseLayoutType = useLayoutType as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;

// This pattern of mocking seems to be required: defining the mocked function here and
// then assigning it with an arrow function wrapper in jest.mock. It is very particular.
// I think it is related to this: https://github.com/swc-project/jest/issues/14#issuecomment-1238621942

jest.mock('@carbon/react/icons', () => ({
  ...(jest.requireActual('@carbon/react/icons') as jest.Mock),
  ShoppingCart: jest.fn((props) => <div data-testid="shopping-cart-icon" {...props} />),
}));

const mockLaunchPatientWorkspace = jest.fn();
const mockLaunchStartVisitPrompt = jest.fn();
const mockUseVisitOrOfflineVisit = jest.fn(() => ({
  activeVisit: {
    uuid: '8ef90c91-14be-42dd-a1c0-e67fbf904470',
  },
  currentVisit: {
    uuid: '8ef90c91-14be-42dd-a1c0-e67fbf904470',
  },
}));
const mockGetPatientUuidFromUrl = jest.fn(() => mockPatient.id);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    getPatientUuidFromUrl: () => mockGetPatientUuidFromUrl(),
    launchPatientWorkspace: (arg) => mockLaunchPatientWorkspace(arg),
    launchStartVisitPrompt: () => mockLaunchStartVisitPrompt(),
    useVisitOrOfflineVisit: () => mockUseVisitOrOfflineVisit(),
    useSystemVisitSetting: jest.fn().mockReturnValue({ data: true }),
  };
});

jest.mock('@openmrs/esm-patient-common-lib/src/get-patient-uuid-from-url', () => {
  return { getPatientUuidFromUrl: () => mockGetPatientUuidFromUrl() };
});

jest.mock('@openmrs/esm-patient-common-lib/src/workspaces/useWorkspaces', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib/src/workspaces/useWorkspaces'),
  useWorkspaces: jest.fn().mockReturnValue({
    workspaces: [{ type: 'order' }],
    workspaceWindowState: 'normal',
  }),
}));

describe('<OrderBasketActionButton/>', () => {
  beforeAll(() => {
    orderBasketStore.setState({
      items: {
        [mockPatient.id]: {
          medications: [{ name: 'order-01', uuid: 'some-uuid' } as unknown as OrderBasketItem],
        },
      },
    });
    mockUsePatient.mockReturnValue({ patientUuid: mockPatient.id });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display tablet view action button', async () => {
    const user = userEvent.setup();
    mockedUseLayoutType.mockReturnValue('tablet');
    render(<OrderBasketActionButton />);

    expect(screen.getByTestId('shopping-cart-icon').getAttribute('size')).toBe('16');
    const orderBasketButton = screen.getByRole('button', { name: /Order Basket/i });
    expect(orderBasketButton).toBeInTheDocument();
    await waitFor(() => user.click(orderBasketButton));
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should display desktop view action button', async () => {
    const user = userEvent.setup();
    mockedUseLayoutType.mockReturnValue('desktop');
    render(<OrderBasketActionButton />);

    expect(screen.getByTestId('shopping-cart-icon').getAttribute('size')).toBe('20');
    const orderBasketButton = screen.getByRole('button', { name: /order basket/i });
    expect(orderBasketButton).toBeInTheDocument();
    await waitFor(() => user.click(orderBasketButton));
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('order-basket');
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should prompt user to start visit if no currentVisit found', async () => {
    const user = userEvent.setup();
    mockedUseLayoutType.mockReturnValue('desktop');
    mockUseVisitOrOfflineVisit.mockImplementation(() => ({
      activeVisit: null,
      currentVisit: null,
    }));
    const screen = render(<OrderBasketActionButton />);

    const orderBasketButton = screen.getByRole('button', { name: /order basket/i });
    expect(orderBasketButton).toBeInTheDocument();
    await waitFor(() => user.click(orderBasketButton));
    expect(mockLaunchPatientWorkspace).not.toBeCalled();
    expect(mockLaunchStartVisitPrompt).toHaveBeenCalled();
    expect(orderBasketButton).toHaveClass('active');
  });

  it('should display a count tag when orders are present on the desktop view', () => {
    mockedUseLayoutType.mockReturnValue('desktop');
    const { result } = renderHook(useOrderBasket);
    expect(result.current.orders).toHaveLength(1); // sanity check
    render(<OrderBasketActionButton />);

    expect(screen.getByText(/order basket/i)).toBeInTheDocument();
    expect(screen.getByText(/1/i)).toBeInTheDocument();
  });

  it('should display the count tag when orders are present on the tablet view', () => {
    mockedUseLayoutType.mockReturnValue('tablet');
    render(<OrderBasketActionButton />);

    expect(screen.getByRole('button', { name: /1 order basket/i })).toBeInTheDocument();
  });
});
