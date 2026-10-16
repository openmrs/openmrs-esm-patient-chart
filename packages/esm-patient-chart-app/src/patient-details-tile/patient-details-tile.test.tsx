import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePrimaryIdentifierCode } from '@openmrs/esm-framework';
import { mockPatient } from 'tools';
import PatientDetailsTile from './patient-details-tile.component';

const mockUsePrimaryIdentifierCode = vi.mocked(usePrimaryIdentifierCode);

describe('PatientDetailsTile', () => {
  it('renders nothing until the patient is loaded', () => {
    mockUsePrimaryIdentifierCode.mockReturnValue({
      primaryIdentifierCode: 'OpenMRS ID',
      isLoading: false,
      error: null,
    });

    const { container } = render(<PatientDetailsTile />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the patient name, details and the primary identifier', () => {
    mockUsePrimaryIdentifierCode.mockReturnValue({
      primaryIdentifierCode: 'OpenMRS ID',
      isLoading: false,
      error: null,
    });

    render(<PatientDetailsTile patient={mockPatient} />);

    expect(screen.getByText(/john wilson/i)).toBeInTheDocument();
    expect(screen.getByText('100GEJ')).toBeInTheDocument();
    expect(screen.getByText(/male/i)).toBeInTheDocument();
  });

  it('falls back to the first identifier when none matches the primary identifier code', () => {
    mockUsePrimaryIdentifierCode.mockReturnValue({
      primaryIdentifierCode: 'Not a real identifier code',
      isLoading: false,
      error: null,
    });

    render(<PatientDetailsTile patient={mockPatient} />);

    expect(screen.getByText('100732HE')).toBeInTheDocument();
  });
});
