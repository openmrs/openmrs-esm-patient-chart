import { render, screen } from '@testing-library/react';
import React from 'react';
import VitalsHeaderStateDetails from './vital-header-details.component';

describe('<VitalsHeaderDetails>', () => {
  const mockParams = { unitName: 'Temp', value: '36.5', unitSymbol: '°C' };

  beforeEach(() => {
    render(
      <VitalsHeaderStateDetails
        unitName={mockParams.unitName}
        value={mockParams.value}
        unitSymbol={mockParams.unitSymbol}
      />,
    );
  });

  it('should display temperature and its symbol', () => {
    expect(screen.getByText('Temp')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
    expect(screen.getByText('36.5')).toBeInTheDocument();
  });
});
