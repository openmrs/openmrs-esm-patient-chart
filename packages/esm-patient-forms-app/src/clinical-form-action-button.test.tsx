import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActionMenuButton, useLayoutType, useWorkspaces } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseWorkspaces = useWorkspaces as jest.Mock;
const mockActionMenuButton = jest.mocked(ActionMenuButton);

mockActionMenuButton.mockImplementation(({ handler, label, tagContent }) => (
  <button onClick={handler}>
    {tagContent} {label}
  </button>
));

mockUseWorkspaces.mockImplementation(() => ({
  active: true,
  windowState: 'normal',
  workspaces: [
    {
      canHide: false,
      name: 'clinical-forms-workspace',
      title: 'Clinical forms',
      preferredWindowSize: 'normal',
      type: 'form',
    },
  ],
  workspaceWindowState: 'normal',
  prompt: null,
}));

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

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    useVisitOrOfflineVisit: jest.fn().mockImplementation(() => mockCurrentVisit),
  };
});

test('should display clinical form action button on tablet view', () => {
  mockUseLayoutType.mockReturnValue('tablet');

  render(<ClinicalFormActionButton />);
  expect(screen.getByRole('button', { name: /Clinical forms/i })).toBeInTheDocument();
});

test('should display clinical form action button on desktop view', () => {
  mockUseLayoutType.mockReturnValue('small-desktop');

  render(<ClinicalFormActionButton />);
  const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
  expect(clinicalActionButton).toBeInTheDocument();
});
