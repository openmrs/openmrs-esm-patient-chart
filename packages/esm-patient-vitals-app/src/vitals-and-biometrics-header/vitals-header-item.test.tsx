import React from 'react';
import { render, screen } from '@testing-library/react';
import { NumericObservation } from '@openmrs/esm-framework';
import VitalsHeaderItem from './vitals-header-item.component';

const mockNumericObservation = jest.mocked(NumericObservation);
const testProps = { unitName: 'Temp', value: '36.5', unitSymbol: '°C', patientUuid: 'test-patient-uuid' };

describe('VitalsHeaderItem', () => {
  it('renders a vital sign in the vitals header', () => {
    render(<VitalsHeaderItem {...testProps} />);

    expect(screen.getByText('Temp')).toBeInTheDocument();
    expect(screen.getByText(/36\.5/)).toBeInTheDocument();
    expect(screen.getByText(/°C/)).toBeInTheDocument();
  });

  it('handles empty unit symbol gracefully', () => {
    const propsWithEmptyUnit = { ...testProps, unitSymbol: '' };
    render(<VitalsHeaderItem {...propsWithEmptyUnit} />);

    expect(screen.getByText('Temp')).toBeInTheDocument();
    expect(screen.getByText(/36\.5/)).toBeInTheDocument();
  });

  it('handles undefined unit symbol gracefully', () => {
    const propsWithUndefinedUnit = { ...testProps, unitSymbol: undefined };
    render(<VitalsHeaderItem {...propsWithUndefinedUnit} />);

    expect(screen.getByText('Temp')).toBeInTheDocument();
    expect(screen.getByText(/36\.5/)).toBeInTheDocument();
  });

  it('passes correct props to NumericObservation', () => {
    render(<VitalsHeaderItem patientUuid="test-patient-uuid" unitName="Temp" value={0} unitSymbol="DEG C" />);

    expect(mockNumericObservation).toHaveBeenCalledWith(
      expect.objectContaining({ value: 0, unit: 'DEG C', label: 'Temp', variant: 'card' }),
      expect.anything(),
    );
  });
});
