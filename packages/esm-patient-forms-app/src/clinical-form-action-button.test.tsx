import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';

const mockedUseLayoutType = useLayoutType as jest.Mock;

const mockCurrentVisit = {
  uuid: '17f512b4-d264-4113-a6fe-160cb38cb46e',
  encounters: [],
  patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
  visitType: {
    uuid: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
    display: 'Facility Visit',
  },
  attributes: [],
  startDatetime: new Date('2021-03-16T08:16:00.000+0000'),
  stopDatetime: null,
  location: {
    uuid: '6351fcf4-e311-4a19-90f9-35667d99a8af',
    name: 'Registration Desk',
    display: 'Registration Desk',
  },
};

jest.mock('@carbon/react/icons', () => ({
  ...(jest.requireActual('@carbon/react/icons') as jest.Mock),
  Document: jest.fn((props) => <div data-testid="document-icon" {...props} />),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,

    useConnectivity: jest.fn().mockReturnValue(true),
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVisitOrOfflineVisit: jest.fn().mockImplementation(() => mockCurrentVisit),
  };
});

jest.mock('@openmrs/esm-patient-common-lib/src/workspaces/useWorkspaces', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib/src/workspaces/useWorkspaces'),
  useWorkspaces: jest.fn().mockImplementation(() => ({
    active: true,
    windowState: 'normal',
    workspaces: [
      {
        name: 'clinical-forms-workspace',
        title: 'Clinical form',
        preferredWindowSize: 'normal',
        type: 'form',
      },
    ],
    prompt: null,
  })),
}));

test('should display clinical form action button on tablet view', () => {
  mockedUseLayoutType.mockReturnValue('tablet');

  render(<ClinicalFormActionButton />);
  expect(screen.getByTestId('document-icon').getAttribute('size')).toBe('16');

  expect(screen.getByRole('button', { name: /Clinical form/i })).toBeInTheDocument();
});

test('should display clinical form action button on desktop view', () => {
  mockedUseLayoutType.mockReturnValue('desktop');

  render(<ClinicalFormActionButton />);
  expect(screen.getByTestId('document-icon').getAttribute('size')).toBe('20');

  const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
  expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
});
