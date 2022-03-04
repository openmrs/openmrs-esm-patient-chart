import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useVisitDialog } from '../visit/useVisitDialog';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockVisits } from '../../../../__mocks__/visits.mock';
import VisitDialog from './visit-dialog.component';

const testProps = { patientUuid: mockPatient.id };

const mockVisitDialog = useVisitDialog as jest.Mock;
const mockGetStartedVisitGetter = jest.fn();

jest.mock('../visit/useVisitDialog', () => ({
  useVisitDialog: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useVisit: jest.fn().mockImplementation(() => mockVisits),
    updateVisit: jest.fn(),
    showToast: jest.fn(),
    showNotification: jest.fn(),
    get getStartedVisit() {
      return mockGetStartedVisitGetter();
    },
  };
});

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('VisitDialog', () => {
  it('renders the visit dialog modal', () => {
    mockVisitDialog.mockReturnValueOnce({ type: 'prompt', state: { type: 'start' } });

    renderVisitDialog();

    expect(screen.getByRole('button', { name: /edit past visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start new visit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end visit/i })).toBeInTheDocument();
    expect(screen.getByText(/no active visit/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /You can't add data to the patient chart without an active visit. Choose from one of the options below to continue/i,
      ),
    ).toBeInTheDocument();
  });

  it('clicking `Start new visit` renders the new visit form in a workspace', () => {
    mockVisitDialog.mockReturnValueOnce({ type: 'prompt', state: { type: 'start' } });

    renderVisitDialog();

    const startNewVisitButton = screen.getByRole('button', { name: /start new visit/i });
    userEvent.click(startNewVisitButton);

    expect(launchPatientWorkspace).toHaveBeenCalled();
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });
});

function renderVisitDialog() {
  render(<VisitDialog {...testProps} />);
}
