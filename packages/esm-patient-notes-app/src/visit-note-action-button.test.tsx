import React from 'react';
import { screen, render } from '@testing-library/react';
import { type LayoutType, useLayoutType } from '@openmrs/esm-framework';
import VisitNoteActionButton from './visit-note-action-button.extension';
import { mockPatient } from 'tools';

const mockUseLayoutType = jest.mocked(useLayoutType);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useStartVisitIfNeeded: jest.fn(() => () => Promise.resolve(true)),
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
