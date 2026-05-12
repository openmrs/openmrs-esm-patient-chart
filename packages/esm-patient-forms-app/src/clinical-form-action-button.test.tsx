import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActionMenuButton2, useLayoutType } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { mockPatient } from 'tools';

const mockActionMenuButton = vi.mocked(ActionMenuButton2);
const mockUseLayoutType = vi.mocked(useLayoutType);

mockActionMenuButton.mockImplementation(({ label, tagContent }) => (
  <button>
    {tagContent} {label}
  </button>
));

vi.mock('@openmrs/esm-patient-common-lib', async () => {
  const originalModule = (await vi.importActual('@openmrs/esm-patient-common-lib')) as object;

  return {
    ...originalModule,
    useStartVisitIfNeeded: vi.fn(() => () => Promise.resolve(true)),
  };
});

describe('<ClinicalFormActionButton>', () => {
  test('should display clinical form action button on tablet view', () => {
    mockUseLayoutType.mockReturnValue('tablet');

    render(
      <ClinicalFormActionButton
        groupProps={{ patientUuid: mockPatient.id, patient: mockPatient, visitContext: null, mutateVisitContext: null }}
      />,
    );
    expect(screen.getByRole('button', { name: /Clinical forms/i })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', () => {
    mockUseLayoutType.mockReturnValue('small-desktop');

    render(
      <ClinicalFormActionButton
        groupProps={{ patientUuid: mockPatient.id, patient: mockPatient, visitContext: null, mutateVisitContext: null }}
      />,
    );
    const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
    expect(clinicalActionButton).toBeInTheDocument();
  });
});
