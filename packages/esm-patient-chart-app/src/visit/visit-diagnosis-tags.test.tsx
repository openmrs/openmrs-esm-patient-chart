import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { type DedupedDiagnosis } from './dedupe-diagnoses';
import VisitDiagnosisTags from './visit-diagnosis-tags.component';

const mockUseConfig = vi.mocked(useConfig);

describe('VisitDiagnosisTags', () => {
  it('shows the certainty beside the name, keeps the full-name tooltip, and adds no label for unknown values', () => {
    mockUseConfig.mockReturnValue({ diagnosisTags: { primaryColor: 'red', secondaryColor: 'blue' } });

    const diagnoses: Array<DedupedDiagnosis> = [
      { uuid: 'dx-1', display: 'Pneumonia', rank: 1, certainty: 'CONFIRMED' },
      { uuid: 'dx-2', display: 'Malaria', rank: 2, certainty: 'PROVISIONAL' },
      { uuid: 'dx-3', display: 'Fatigue', rank: 2, certainty: 'REFUTED' },
    ];

    render(<VisitDiagnosisTags diagnoses={diagnoses} />);

    // Certainty is visible text alongside the name (reaches touch devices, not hover-only)
    expect(screen.getByText('(Confirmed)')).toBeInTheDocument();
    expect(screen.getByText('(Provisional)')).toBeInTheDocument();

    // The full diagnosis name stays revealable when truncated
    expect(screen.getByTitle('Pneumonia')).toHaveTextContent('Pneumonia');
    expect(screen.getByTitle('Malaria')).toHaveTextContent('Malaria');

    // Unknown certainty: tag renders with the name only
    expect(screen.getByTitle('Fatigue')).toBeInTheDocument();
    expect(screen.queryByText('(REFUTED)')).not.toBeInTheDocument();
  });
});
