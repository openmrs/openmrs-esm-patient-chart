import React from 'react';
import ConfigurableForms from './configurable-forms.component';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockConfigurableForms } from '../../../../__mocks__/forms.mock';

const testProps = {
  headerTitle: 'Configurable Forms',
  isValidating: false,
  patientUuid: 'test-patient-uuid',
  patient: mockPatient,
  pageSize: 10,
  pageUrl: '/patient/1234',
  urlLabel: 'Go to patient dashboard',
  error: null,
};

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    formatDatetime: jest.fn().mockImplementation((date) => date),
    usePagination: jest.fn().mockImplementation((data) => ({
      currentPage: 1,
      goTo: () => {},
      results: data,
    })),
  };
});
jest.mock('lodash/debounce', () => jest.fn((fn) => fn));
describe('ConfigurableForms', () => {
  test('should render ConfigurableForms component', async () => {
    render(<ConfigurableForms {...testProps} formsToDisplay={mockConfigurableForms as Array<any>} />);

    expect(await screen.findByRole('heading', { name: 'Configurable Forms' })).toBeInTheDocument();
    const completedTab = await screen.findByRole('tab', { name: 'Completed' });
    const availableTab = await screen.findByRole('tab', { name: 'Available' });
    expect(completedTab).toBeInTheDocument();
    expect(availableTab).toBeInTheDocument();

    const formListTable = screen.getByRole('table');
    const tableRows = screen.getAllByRole('row', { within: formListTable });
    expect(tableRows.length).toBe(3);

    // should be able to perform search
    const searchInput = screen.getByRole('searchbox', { name: 'Filter table' });
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Enhanced Adherence Screening' } });
    expect(searchInput).toHaveValue('Enhanced Adherence Screening');

    const searchedRow = screen.getByRole('row', { name: /Enhanced Adherence Screening/ });
    expect(searchedRow).toBeInTheDocument();

    // should display empty state when no forms are available
    fireEvent.change(searchInput, { target: { value: 'Non-existent Form' } });
    expect(screen.getByText('No matching forms to display')).toBeInTheDocument();

    // should be able to clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(searchInput).toHaveValue('');

    // should be able to navigate to patient dashboard
    const patientDashboardLink = screen.getByRole('link', { name: 'Go to patient dashboard' });
    expect(patientDashboardLink).toBeInTheDocument();
    expect(patientDashboardLink).toHaveAttribute('href', '/patient/1234');

    // should be able to toggle between tabs
    fireEvent.click(availableTab);
    expect(availableTab).toHaveAttribute('aria-selected', 'true');
    expect(completedTab).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(completedTab);
    expect(completedTab).toHaveAttribute('aria-selected', 'true');
    expect(availableTab).toHaveAttribute('aria-selected', 'false');

    // should display completed forms
    const completedFormListTable = screen.getByRole('table');
    const completedTableRows = screen.getAllByRole('row', { within: completedFormListTable });
    expect(completedTableRows.length).toBe(2);
    expect(screen.getByRole('row', { name: /Alcohol and Drug Abuse Screening/i })).toBeInTheDocument();
  });
});
