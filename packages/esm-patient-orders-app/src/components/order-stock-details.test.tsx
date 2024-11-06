import React from 'react';
import { screen } from '@testing-library/react';
import OrderStockDetailsComponent from './order-stock-details.component';
import { useOrderStockInfo } from '../hooks/useOrderStockInfo';
import { renderWithSwr } from 'tools';
import { useTranslation } from 'react-i18next';
import { mockOrderStockData } from '__mocks__';

const mockUseOrderStockInfo = jest.mocked(useOrderStockInfo);

jest.mock('../hooks/useOrderStockInfo', () => ({
  useOrderStockInfo: jest.fn(),
}));

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
    mockUseOrderStockInfo.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders nothing when stock data is null', () => {
    mockUseOrderStockInfo.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const { container } = renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders "In Stock" when item is active and has positive quantity', () => {
    mockUseOrderStockInfo.mockReturnValue({
      data: mockOrderStockData,
      isLoading: false,
      error: null,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText(/In stock/i)).toBeInTheDocument();
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

    mockUseOrderStockInfo.mockReturnValue({
      data: outOfStockData,
      isLoading: false,
      error: null,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText(/Out of stock/i)).toBeInTheDocument();
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

    mockUseOrderStockInfo.mockReturnValue({
      data: inactiveData,
      isLoading: false,
      error: null,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText(/Out of stock/i)).toBeInTheDocument();
    expect(screen.getByText('CloseFilledIcon')).toBeInTheDocument();
  });

  it('renders "Out of Stock" when entry array is empty', () => {
    const emptyData = {
      ...mockOrderStockData,
      entry: [],
    };

    mockUseOrderStockInfo.mockReturnValue({
      data: emptyData,
      isLoading: false,
      error: null,
    });

    renderWithSwr(<OrderStockDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText(/Out of stock/i)).toBeInTheDocument();
    expect(screen.getByText('CloseFilledIcon')).toBeInTheDocument();
  });
});
