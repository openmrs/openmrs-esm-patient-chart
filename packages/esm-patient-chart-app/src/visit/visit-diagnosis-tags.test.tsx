import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { type DedupedDiagnosis } from './dedupe-diagnoses';
import VisitDiagnosisTags from './visit-diagnosis-tags.component';

const mockUseConfig = vi.mocked(useConfig);

describe('VisitDiagnosisTags', () => {
  it('surfaces the diagnosis certainty as a tooltip and to screen readers, but adds no label for unknown values', () => {
    mockUseConfig.mockReturnValue({ diagnosisTags: { primaryColor: 'red', secondaryColor: 'blue' } });

    const diagnoses: Array<DedupedDiagnosis> = [
      { uuid: 'dx-1', display: 'Pneumonia', rank: 1, certainty: 'CONFIRMED' },
      { uuid: 'dx-2', display: 'Malaria', rank: 2, certainty: 'PROVISIONAL' },
      { uuid: 'dx-3', display: 'Fatigue', rank: 2, certainty: 'REFUTED' },
    ];

    render(<VisitDiagnosisTags diagnoses={diagnoses} />);

    // Screen-reader text accompanies each known certainty
    expect(screen.getByText('(Confirmed)')).toBeInTheDocument();
    expect(screen.getByText('(Provisional)')).toBeInTheDocument();

    // The tooltip host wraps the tag, is keyboard-focusable, and carries the label the
    // CSS tooltip renders
    const confirmedHost = screen.getByText((_, element) => element?.getAttribute('data-certainty') === 'Confirmed');
    expect(confirmedHost).toHaveTextContent('Pneumonia (Confirmed)');
    expect(confirmedHost).toHaveAttribute('tabindex', '0');
    const provisionalHost = screen.getByText((_, element) => element?.getAttribute('data-certainty') === 'Provisional');
    expect(provisionalHost).toHaveTextContent('Malaria (Provisional)');

    // Unknown certainty: tag renders with no tooltip and no screen-reader suffix
    expect(screen.getByText('Fatigue')).toBeInTheDocument();
    expect(screen.queryByText('(REFUTED)')).not.toBeInTheDocument();
    expect(screen.queryByText((_, element) => element?.getAttribute('data-certainty') === 'REFUTED')).not.toBeInTheDocument();
  });
});
