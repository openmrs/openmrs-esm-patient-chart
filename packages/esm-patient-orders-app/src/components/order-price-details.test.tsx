import React from 'react';
import { screen } from '@testing-library/react';
import OrderPriceDetailsComponent from './order-price-details.component';
import { useOrderPrice } from '../hooks/useOrderPrice';
import { renderWithSwr } from 'tools';
import { useTranslation } from 'react-i18next';
import { mockOrderPriceData } from '../../../../__mocks__/order-price-data.mock';

const mockUseOrderPrice = jest.mocked(useOrderPrice);

jest.mock('../hooks/useOrderPrice', () => ({
  useOrderPrice: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.Mock;

describe('OrderPriceDetailsComponent', () => {
  const mockOrderItemUuid = 'test-uuid';

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseTranslation.mockImplementation(() => ({
      t: (key: string, fallback: string) => fallback,
      i18n: { language: 'en-US' },
    }));
  });

  it('renders loading skeleton when data is loading', () => {
    mockUseOrderPrice.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(screen.getByTestId('skeleton-text')).toBeInTheDocument();
  });

  it('renders nothing when amount is null', () => {
    mockUseOrderPrice.mockReturnValue({
      data: {
        ...mockOrderPriceData,
        entry: [],
      },
      isLoading: false,
      error: null,
    });

    const { container } = renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders price correctly with USD currency', () => {
    mockUseOrderPrice.mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
      error: null,
    });

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText('Price:')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('formats price correctly for different locales', () => {
    mockUseOrderPrice.mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
      error: null,
    });

    // Change to German locale for this test
    mockUseTranslation.mockImplementation(() => ({
      t: (key: string, fallback: string) => fallback,
      i18n: { language: 'de-DE' },
    }));

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    // German locale uses comma as decimal separator
    expect(screen.getByText('99,99 $')).toBeInTheDocument();
  });

  it('displays tooltip with price disclaimer', () => {
    mockUseOrderPrice.mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
      error: null,
    });

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/This price is indicative/)).toBeInTheDocument();
  });
});
