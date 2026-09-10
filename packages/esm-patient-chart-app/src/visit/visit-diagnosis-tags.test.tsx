import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { type DedupedDiagnosis } from './dedupe-diagnoses';
import VisitDiagnosisTags from './visit-diagnosis-tags.component';

const mockUseConfig = vi.mocked(useConfig);

describe('VisitDiagnosisTags', () => {
  it('shows the diagnosis certainty on hover and to screen readers, but adds no label for unknown values', () => {
    mockUseConfig.mockReturnValue({ diagnosisTags: { primaryColor: 'red', secondaryColor: 'blue' } });

    const diagnoses: Array<DedupedDiagnosis> = [
      { uuid: 'dx-1', display: 'Pneumonia', rank: 1, certainty: 'CONFIRMED' },
      { uuid: 'dx-2', display: 'Malaria', rank: 2, certainty: 'PROVISIONAL' },
      { uuid: 'dx-3', display: 'Fatigue', rank: 2, certainty: 'REFUTED' },
    ];

    render(<VisitDiagnosisTags diagnoses={diagnoses} />);

    expect(screen.getByTitle('Confirmed')).toHaveTextContent('Pneumonia (Confirmed)');
    expect(screen.getByTitle('Provisional')).toHaveTextContent('Malaria (Provisional)');
    // The unknown-certainty tag renders, but only the two known-certainty tags carry a tooltip
    expect(screen.getByText('Fatigue')).toBeInTheDocument();
    expect(screen.getAllByTitle(/.+/)).toHaveLength(2);
  });
});
