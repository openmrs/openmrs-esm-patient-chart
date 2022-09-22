import React from 'react';
import ReactDOM from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import ClinicalFormActionButton from './clinical-form-action-button.component';
import { useVisitOrOfflineVisit } from '@openmrs/esm-patient-common-lib';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

const mockedUseLayoutType = useLayoutType as jest.Mock;
const mockUseVisitOrOfflineVisit = useVisitOrOfflineVisit as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...(jest.requireActual('@openmrs/esm-patient-common-lib') as any),
  useVisitOrOfflineVisit: jest.fn(),
}));

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

describe('<ClinicalFormActionButton/>', () => {
  test('should display clinical form action button on tablet view', () => {
    mockedUseLayoutType.mockReturnValue('tablet');

    renderClinicalFormActionButton();

    expect(screen.getByRole('button', { name: /Clinical form/i })).toBeInTheDocument();
  });

  test('should display clinical form action button on desktop view', () => {
    mockedUseLayoutType.mockReturnValue('desktop');

    renderClinicalFormActionButton();

    const clinicalActionButton = screen.getByRole('button', { name: /Form/i });
    expect(clinicalActionButton).not.toHaveTextContent('Clinical form');
  });
});

function renderClinicalFormActionButton() {
  mockUseVisitOrOfflineVisit.mockReturnValue({
    currentVisit: mockCurrentVisit,
    error: null,
  });
  act(() => {
    ReactDOM.createRoot(container).render(<ClinicalFormActionButton />);
  });
}
