import React from 'react';
import ProgramsOverview from './programs-overview.component';
import { of } from 'rxjs/internal/observable/of';
import { render, screen, fireEvent } from '@testing-library/react';
import { mockEnrolledProgramsResponse } from '../../../../__mocks__/programs.mock';
import * as mockProgramResource from './programs.resource';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { attach } from '@openmrs/esm-framework';
import { throwError } from 'rxjs';

const mockAttach = attach as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework/mock'),
  attach: jest.fn(),
}));

describe('<ProgramsOverview />', () => {
  const renderProgramOverview = () => {
    spyOn(mockProgramResource, 'fetchActiveEnrollments').and.returnValue(of(mockEnrolledProgramsResponse));
    render(<ProgramsOverview patientUuid={mockPatient.id} basePath={'/'} />);
  };

  const renderEmptyStateProgramOverview = () => {
    spyOn(mockProgramResource, 'fetchActiveEnrollments').and.returnValue(of([]));
    render(<ProgramsOverview patientUuid={mockPatient.id} basePath={'/'} />);
  };

  const renderErrorStateProgramOverview = () => {
    spyOn(mockProgramResource, 'fetchActiveEnrollments').and.returnValue(throwError('loading error'));
    render(<ProgramsOverview patientUuid={mockPatient.id} basePath={'/'} />);
  };

  it("should display the patient's program enrollments", async () => {
    renderProgramOverview();
    await screen.findByRole('heading', { name: /Care Programs/i });

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    const addBtn = screen.getByRole('button', { name: 'Add' });
    expect(addBtn).toBeInTheDocument();
    expect(screen.getAllByText(/Active Programs/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Date enrolled/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/HIV Care and Treatment/i)[0]).toBeInTheDocument();

    // Clicking "Add" launches form tab
    fireEvent.click(addBtn);
    expect(mockAttach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'programs-workspace');
  });

  it('renders an empty state view when conditions data is absent', async () => {
    renderEmptyStateProgramOverview();

    await screen.findByRole('heading', { name: /Care Programs/i });

    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no program enrollments to display for this patient/)).toBeInTheDocument();
    expect(screen.getByText(/Record program enrollments/)).toBeInTheDocument();
  });

  it('render an error state when an error occurrs', () => {
    renderErrorStateProgramOverview();
    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./,
      ),
    ).toBeInTheDocument();
  });
});
