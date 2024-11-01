import React from 'react';
import { screen } from '@testing-library/react';
import OrderStockDetailsComponent from './order-stock-details.component';
import { useOrderStockInfo } from '../hooks/useOrderStockInfo';
import { renderWithSwr } from 'tools';
import { useTranslation } from 'react-i18next';
import { mockOrderStockData } from '../../../../__mocks__/order-stock-data.mock';

jest.mock('../hooks/useOrderStockInfo');
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.Mock;

describe('OrderStockDetailsComponent', () => {
  const mockOrderItemUuid = 'test-uuid';

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseTranslation.mockImplementation(() => ({
      t: (key: string, fallback: string) => fallback,
    }));
  });

  it('renders loading skeleton when data is loading', () => {
    (useOrderStockInfo as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(screen.getByTestId('skeleton-text')).toBeInTheDocument();
  });

  it('renders nothing when stock data is null', () => {
    (useOrderStockInfo as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    const { container } = renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "In Stock" when item is active and has positive quantity', () => {
    (useOrderStockInfo as jest.Mock).mockReturnValue({
      data: mockOrderStockData,
      isLoading: false,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('CheckmarkFilledIcon')).toBeInTheDocument();
  });

  it('renders "Out of Stock" when item has zero quantity', () => {
    const outOfStockData = {
      ...mockOrderStockData,
      entry: [
        {
          ...mockOrderStockData.entry[0],
          resource: {
            ...mockOrderStockData.entry[0].resource,
            netContent: {
              value: 0,
              unit: 'units',
            },
          },
        },
      ],
    };

    (useOrderStockInfo as jest.Mock).mockReturnValue({
      data: outOfStockData,
      isLoading: false,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('CloseFilledIcon')).toBeInTheDocument();
  });

  it('renders "Out of Stock" when item is inactive', () => {
    const inactiveData = {
      ...mockOrderStockData,
      entry: [
        {
          ...mockOrderStockData.entry[0],
          resource: {
            ...mockOrderStockData.entry[0].resource,
            status: 'inactive',
          },
        },
      ],
    };

    (useOrderStockInfo as jest.Mock).mockReturnValue({
      data: inactiveData,
      isLoading: false,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('CloseFilledIcon')).toBeInTheDocument();
  });

  it('renders "Out of Stock" when entry array is empty', () => {
    const emptyData = {
      ...mockOrderStockData,
      entry: [],
    };

    (useOrderStockInfo as jest.Mock).mockReturnValue({
      data: emptyData,
      isLoading: false,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('CloseFilledIcon')).toBeInTheDocument();
  });
});
