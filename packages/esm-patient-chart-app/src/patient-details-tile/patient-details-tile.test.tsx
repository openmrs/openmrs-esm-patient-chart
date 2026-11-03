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

  it.each([
    { label: 'an exact birthdate', birthDate: '1993-10-14', expected: '14 — Oct — 1993' },
    { label: 'an estimated birthdate known to the year', birthDate: '1993', expected: '1993' },
    { label: 'an estimated birthdate known to the month', birthDate: '2024-03', expected: 'Mar — 2024' },
  ])('shows $label at its recorded precision', ({ birthDate, expected }) => {
    mockUsePrimaryIdentifierCode.mockReturnValue({
      primaryIdentifierCode: 'OpenMRS ID',
      isLoading: false,
      error: null,
    });

    render(<PatientDetailsTile patient={{ ...mockPatient, birthDate }} />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
