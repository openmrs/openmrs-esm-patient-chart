import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import VisitDialog from './visit-dialog.component';
import * as mockUseVisitDialog from './useVisitDialog';
import * as mockEsmOpenmrsFramwork from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

const testProps = { patientUuid: mockPatient.id };

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

fdescribe('VisitDialog', () => {
  beforeEach(() => {
    spyOn(mockEsmOpenmrsFramwork, 'useVisit').and.returnValue({ currentVisit: mockCurrentVisit });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders start visit dialog modal', async () => {
    spyOn(mockUseVisitDialog, 'useVisitDialog').and.returnValue({ type: 'prompt', state: { type: 'start' } });
    renderVisitDialog();
    window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'prompt', state: { type: 'past' } } }));

    expect(screen.getByText(/No active visit/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /You can't add data to the patient chart without an active visit. Choose from one of the options below to continue./,
      ),
    ).toBeInTheDocument();

    const startNewVisitButton = screen.getByRole('button', { name: /Start new visit/ });
    userEvent.click(startNewVisitButton);

    expect(launchPatientWorkspace).toHaveBeenCalled();

    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');
  });

  it('renders end visit dialog modal', async () => {
    spyOn(mockUseVisitDialog, 'useVisitDialog').and.returnValue({ type: 'end' });
    renderVisitDialog();
    window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'end' } }));
    expect(screen.getByRole('heading', { name: /End active visit/i }));
    expect(
      screen.getByText('Ending this visit, will not allow you to fill another encounter form for this patient'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /End visit/i })).toBeInTheDocument();
  });

  it('renders cancel visit dialog modal', async () => {
    spyOn(mockUseVisitDialog, 'useVisitDialog').and.returnValue({ type: 'cancel' });
    renderVisitDialog();
    window.dispatchEvent(new CustomEvent('visit-dialog', { detail: { type: 'cancel' } }));
    expect(screen.getByRole('heading', { name: /Cancel active visit/i }));
    expect(screen.getByText('Canceling this visit will delete all associated encounter(s)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel visit/i })).toBeInTheDocument();
  });
});

function renderVisitDialog() {
  render(<VisitDialog {...testProps} />);
}
