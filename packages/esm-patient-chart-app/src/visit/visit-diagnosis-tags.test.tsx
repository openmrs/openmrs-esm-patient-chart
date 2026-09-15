import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import { type DedupedDiagnosis } from './dedupe-diagnoses';
import VisitDiagnosisTags from './visit-diagnosis-tags.component';

const mockUseConfig = vi.mocked(useConfig);

describe('VisitDiagnosisTags', () => {
  it('shows the certainty beside the name, reveals the full name in a tooltip, and adds no label for unknown values', async () => {
    const user = userEvent.setup();
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

    // Unknown certainty: tag renders with the name only
    const [pneumoniaTag, , fatigueTag] = screen.getAllByTestId('diagnosis-tag');
    expect(fatigueTag).toHaveTextContent('Fatigue');
    expect(screen.queryByText('(REFUTED)')).not.toBeInTheDocument();

    // Hovering a focusable pill portals a visual full-name tooltip (the pill's own DOM
    // text is already complete for screen readers, so the tooltip is aria-hidden)
    expect(pneumoniaTag).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByText('Pneumonia')).toHaveLength(1);
    await user.hover(pneumoniaTag);
    expect(screen.getAllByText('Pneumonia')).toHaveLength(2);
    await user.unhover(pneumoniaTag);
    expect(screen.getAllByText('Pneumonia')).toHaveLength(1);
  });
});
