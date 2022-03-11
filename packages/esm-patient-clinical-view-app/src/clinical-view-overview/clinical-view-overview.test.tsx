import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import ClinicalViewOverview from './clinical-view-overview.component';
import { ExtensionSlot } from '@openmrs/esm-framework';

const testProps = {
  patientUuid: mockPatient.id,
  patient: mockPatient,
};

const mockClinicalViews = [
  { slotName: '', slot: 'All', checked: false },
  { slotName: 'Breadcrumbs', slot: 'Breadcrumbs', checked: false },
  { slotName: 'top-nav-actions-slot', slot: 'Top Nav Actions', checked: false },
  { slotName: 'user-panel-slot', slot: 'User Panel', checked: true },
  { slotName: 'app-menu-slot', slot: 'App Menu', checked: false },
];

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useConfig: jest.fn().mockImplementation(() => ({
    clinicalViews: mockClinicalViews,
  })),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('ClinicalViewOverview: ', () => {
  it('renders an overview of the available clinical views', () => {
    renderClinicalViewOverview();

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add view/i })).toBeInTheDocument();

    mockClinicalViews.map((clinicalView) =>
      expect(screen.getByRole('tab', { name: clinicalView.slot })).toBeInTheDocument(),
    );
    const breadCrampCheck = screen.getByRole('tab', { name: 'Breadcrumbs' });
    userEvent.click(breadCrampCheck);
    expect(screen.getByText('Edit View')).toBeTruthy();
  });

  it('clicking the add button launches the `Add clinical views` form', () => {
    renderClinicalViewOverview();

    const addClinicalViewButton = screen.getByRole('button', { name: /Add view/i });
    userEvent.click(addClinicalViewButton);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('patient-clinical-view-form-workspace');
  });
});

function renderClinicalViewOverview() {
  render(<ClinicalViewOverview {...testProps} />);
}
