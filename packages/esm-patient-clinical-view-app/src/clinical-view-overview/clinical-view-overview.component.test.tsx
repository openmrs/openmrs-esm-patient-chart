import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ClinicalViewOverview from './clinical-view-overview.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { attach, useConfig, ExtensionSlot } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';

const mockConfig = useConfig as jest.Mock;
window.HTMLElement.prototype.scrollIntoView = jest.fn();
const mockExtensionSlot = ExtensionSlot as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useConfig: jest.fn(),
  attach: jest.fn(),
  ExtensionSlot: jest.fn(),
}));

describe('<ClinicalViewOverview/>', () => {
  const renderClinicalOverview = () => {
    mockExtensionSlot.mockImplementation((ext) => ext.slot);
    mockConfig.mockReturnValue({
      clinicalViews: [
        { slotName: '', slot: 'All', checked: false },
        { slotName: 'Breadcrumbs', slot: 'Breadcrumbs', checked: false },
        { slotName: 'top-nav-actions-slot', slot: 'Top Nav Actions', checked: false },
        { slotName: 'user-panel-slot', slot: 'User Panel', checked: true },
        { slotName: 'app-menu-slot', slot: 'App Menu', checked: false },
      ],
    });
    render(<ClinicalViewOverview patient={mockPatient} patientUuid={mockPatient.id} />);
  };

  it('should render clinical view correctly', () => {
    renderClinicalOverview();
    expect(screen.getByText(/Clinical Views/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add View' })).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /Breadcrumbs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Top Nav Actions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /User Panel/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /App Menu/i })).toBeInTheDocument();
  });

  it('should open clinical view form', () => {
    renderClinicalOverview();
    const addClinicalViewButton = screen.getByRole('button', { name: /Add View/i });
    userEvent.click(addClinicalViewButton);
    expect(attach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'patient-clinical-view-form-workspace');
  });

  it('should display an empty state', () => {
    mockExtensionSlot.mockImplementation((ext) => ext.slot);
    mockConfig.mockReturnValue({
      clinicalViews: [{ slotName: '', slot: 'All', checked: false }],
    });
    render(<ClinicalViewOverview patient={mockPatient} patientUuid={mockPatient.id} />);
    expect(screen.getByText(/Sorry, no clinical views configured/i)).toBeInTheDocument();
  });
});
