import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { mockCurrentVisit } from '../../../__mocks__/visits.mock';

const mockedUseLayoutType = useLayoutType as jest.Mock;

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
    useWorkspaces: jest.fn().mockImplementation(() => ({
      active: true,
      windowState: 'normal',
      workspaces: [
        {
          name: 'clinical-forms-workspace',
          title: 'Clinical form',
          preferredWindowSize: 'normal',
          type: 'order',
        },
      ],
      prompt: null,
    })),
  };
});

test('should display clinical form action button on tablet view', () => {
  mockedUseLayoutType.mockReturnValue('tablet');

  render(<ClinicalFormActionButton />);

  expect(screen.getByRole('button', { name: /Clinical form/i })).toBeInTheDocument();
});

test('should display clinical form action button on desktop view', () => {
  mockedUseLayoutType.mockReturnValue('desktop');

  render(<ClinicalFormActionButton />);

  const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
  expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
});
