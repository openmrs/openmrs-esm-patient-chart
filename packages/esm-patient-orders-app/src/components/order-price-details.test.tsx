import React from 'react';
import { screen } from '@testing-library/react';
import OrderPriceDetailsComponent from './order-price-details.component';
import { useOrderPrice } from '../hooks/useOrderPrice';
import { renderWithSwr } from 'tools';
import { useTranslation } from 'react-i18next';
import { mockOrderPriceData } from '../../../../__mocks__/order-price-data.mock';

jest.mock('../hooks/useOrderPrice');
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
    (useOrderPrice as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(screen.getByTestId('skeleton-text')).toBeInTheDocument();
  });

  it('renders nothing when amount is null', () => {
    (useOrderPrice as jest.Mock).mockReturnValue({
      data: {
        ...mockOrderPriceData,
        entry: [],
      },
      isLoading: false,
    });

    const { container } = renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders price correctly with USD currency', () => {
    (useOrderPrice as jest.Mock).mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
    });

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByText('Price:')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('formats price correctly for different locales', () => {
    (useOrderPrice as jest.Mock).mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
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
    (useOrderPrice as jest.Mock).mockReturnValue({
      data: mockOrderPriceData,
      isLoading: false,
    });

    renderWithSwr(<OrderPriceDetailsComponent orderItemUuid={mockOrderItemUuid} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByLabelText(/This price is indicative/)).toBeInTheDocument();
  });
});
