import React from 'react';
import { render, screen } from '@testing-library/react';
import VitalsHeaderItem from './vitals-header-item.component';

const testProps = { unitName: 'Temp', value: 36.5, unitSymbol: '°C' };

describe('VitalsHeaderItem', () => {
  it('renders a vital sign in the vitals header', () => {
    render(<VitalsHeaderItem {...testProps} />);

    expect(screen.getByText('Temp')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
    expect(screen.getByText('36.5')).toBeInTheDocument();
  });

  describe('unit symbol display', () => {
    it('shows unit symbol for numeric values', () => {
      render(<VitalsHeaderItem unitName="BMI" value={23.5} unitSymbol="kg/m²" />);
      expect(screen.getByText('kg/m²')).toBeInTheDocument();
    });

    it('does not show unit symbol for null-like strings', () => {
      render(<VitalsHeaderItem unitName="BMI" value="-- null" unitSymbol="kg/m²" />);
      expect(screen.queryByText('kg/m²')).not.toBeInTheDocument();
    });

    it('does not show unit symbol for string numbers', () => {
      render(<VitalsHeaderItem unitName="BMI" value="23.5" unitSymbol="kg/m²" />);
      expect(screen.queryByText('kg/m²')).not.toBeInTheDocument();
    });

    it('shows unit symbol for blood pressure format strings', () => {
      render(<VitalsHeaderItem unitName="BP" value="120 / 80" unitSymbol="mmHg" />);
      expect(screen.getByText('mmHg')).toBeInTheDocument();
    });
  });
});
