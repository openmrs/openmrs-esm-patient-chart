import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import { type LayoutType, useLayoutType } from '@openmrs/esm-framework';
import VisitNoteActionButton from './visit-note-action-button.extension';
import { mockPatient } from 'tools';

const mockUseLayoutType = vi.mocked(useLayoutType);

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    useStartVisitIfNeeded: vi.fn(() => () => Promise.resolve(true)),
  };
});

describe('VisitNoteActionButton', () => {
  it('should display tablet view', async () => {
    mockUseLayoutType.mockReturnValue('tablet');

    render(
      <VisitNoteActionButton
        groupProps={{ patientUuid: 'patient-uuid', mutateVisitContext: null, patient: null, visitContext: null }}
      />,
    );
  });

  it('should display desktop view', async () => {
    mockUseLayoutType.mockReturnValue('desktop' as LayoutType);

    render(
      <VisitNoteActionButton
        groupProps={{ patientUuid: mockPatient.id, patient: mockPatient, visitContext: null, mutateVisitContext: null }}
      />,
    );

    const visitNoteButton = screen.getByRole('button', { name: /Note/i });
    expect(visitNoteButton).toBeInTheDocument();
  });
});
