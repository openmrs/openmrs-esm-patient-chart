import React from 'react';
import Forms from './forms.component';
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen } from '@testing-library/react';
import { useVisit, usePagination } from '@openmrs/esm-framework';
import { mockForms, mockPatientEncounters } from '../../../../__mocks__/forms.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import { useForms } from '../hooks/useForms';

const mockUseForms = useForms as jest.Mock;
const mockUseVisit = useVisit as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
  usePagination: jest.fn(),
}));

jest.mock('../hooks/useForms', () => ({
  useForms: jest.fn(),
}));

describe('<FormsComponent>', () => {
  const renderEmptyForm = () => {
    mockUseForms.mockReturnValue({
      forms: [],
      filledForms: [],
      completedForms: [],
      encounters: [],
      loading: false,
      error: [],
    });
    render(<Forms patientUuid={mockPatient.id} patient={mockPatient} pageSize={5} pageUrl={'/seeAll'} urlLabel="" />);
  };
  const renderCompleteForm = () => {
    mockUseForms.mockReturnValue({
      forms: mockForms,
      filledForms: mockForms,
      completedForms: mockForms,
      encounters: mockPatientEncounters,
      loading: false,
      error: [],
    });
    mockUseVisit.mockReturnValue({
      currentVisit: mockCurrentVisit.visitData,
      error: null,
    });
    mockUsePagination.mockReturnValue({
      results: mockForms.slice(0, 3),
      goTo: () => {},
      currentPage: 1,
    });
    render(<Forms patientUuid={mockPatient.id} patient={mockPatient} pageSize={5} pageUrl={'/seeAll'} urlLabel="" />);
  };

  afterEach(() => {
    cleanup();
  });

  it('should display empty state when no forms are available', async () => {
    renderEmptyForm();
    expect(screen.getByText(/There are no Forms to display for this patient/i)).toBeInTheDocument();
  });

  it('should display all the available forms', async () => {
    renderCompleteForm();
    const searchInput = screen.getByPlaceholderText(/Search for a form/i);
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByText(/Biometrics/)).toBeInTheDocument();
    expect(screen.getByText(/POC Vitals v1.0/)).toBeInTheDocument();
    expect(screen.getByText(/Admission/)).toBeInTheDocument();
  });

  it('should display the correct view when content switcher is clicked', async () => {
    renderCompleteForm();
    const allFormsButton = screen.getByRole('tab', { name: /All/i });
    userEvent.click(allFormsButton);
    expect(allFormsButton).toHaveAttribute('aria-selected', 'true');
    const completedFormsButton = screen.getByRole('tab', {
      name: /Completed/i,
    });
    userEvent.click(completedFormsButton);
    expect(completedFormsButton).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/POC Vitals/i)).toBeInTheDocument();

    const recommendedFormsButton = screen.getByRole('tab', { name: /Recommended/i });
    userEvent.click(recommendedFormsButton);
    expect(await screen.findByText(/No recommended forms available at the moment/)).toBeInTheDocument();
  });

  it('should display error state', () => {
    mockUseForms.mockReturnValue({
      forms: [],
      filledForms: [],
      completedForms: [],
      encounters: [],
      loading: false,
      error: ['error', 'error2'],
    });
    render(<Forms patientUuid={mockPatient.id} patient={mockPatient} pageSize={5} pageUrl={'/seeAll'} urlLabel="" />);
    expect(screen.getByText(/Forms Error/i)).toBeInTheDocument();
  });
});
