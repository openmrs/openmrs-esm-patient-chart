import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActionMenuButton2, useLayoutType } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { mockPatient } from 'tools';

const mockActionMenuButton = jest.mocked(ActionMenuButton2);
const mockUseLayoutType = jest.mocked(useLayoutType);

mockActionMenuButton.mockImplementation(({ label, tagContent }) => (
  <button>
    {tagContent} {label}
  </button>
));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useStartVisitIfNeeded: jest.fn(() => () => Promise.resolve(true)),
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
