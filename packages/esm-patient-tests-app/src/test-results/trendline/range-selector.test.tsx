import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import RangeSelector from './range-selector.component';

describe('RangeSelector', () => {
  const mockSetLowerRange = jest.fn();
  const user = userEvent.setup();

  it('should render all range tabs', () => {
    const upperRange = new Date('2024-12-31');
    render(<RangeSelector setLowerRange={mockSetLowerRange} upperRange={upperRange} />);

    expect(screen.getByRole('tablist', { name: /trendline range tabs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /1 day/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /5 days/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /1 month/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /6 months/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /1 year/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /5 years/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();

    // first tab is selected by default
    expect(screen.getByRole('tab', { name: /1 day/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /5 days/i })).toHaveAttribute('aria-selected', 'false');
  });

  it.each([
    ['1 day', 1],
    ['5 days', 5],
    ['1 month', 30],
    ['6 months', 182],
    ['1 year', 365],
    ['5 years', 5 * 365],
  ])('should set lower range correctly for %s', async (label, days) => {
    const upperRange = new Date('2024-12-31');
    render(<RangeSelector setLowerRange={mockSetLowerRange} upperRange={upperRange} />);

    const expectedLowerRange = new Date(upperRange.getTime() - days * 24 * 3600 * 1000);

    await user.click(screen.getByText(label));
    expect(mockSetLowerRange).toHaveBeenCalledWith(expectedLowerRange);
  });

  it('should set lower range to start of epoch for "All" range', async () => {
    const upperRange = new Date('2024-12-31');
    render(<RangeSelector setLowerRange={mockSetLowerRange} upperRange={upperRange} />);

    await user.click(screen.getByRole('tab', { name: /all/i }));
    expect(mockSetLowerRange).toHaveBeenCalledWith(new Date(0));
  });
});
