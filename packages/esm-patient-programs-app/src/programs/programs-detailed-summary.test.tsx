import React from 'react';
import ProgramsDetailedSummary from './programs-detailed-summary.component';
import { cleanup, render, RenderResult, screen } from '@testing-library/react';
import { mockEnrolledProgramsResponse } from '../../../../__mocks__/programs.mock';
import * as mockProgramContext from './programs.context';
import * as mockProgramsResource from './programs.resource';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { of, throwError } from 'rxjs';

describe('<ProgramsDetailedSummary />', () => {
  afterEach(cleanup);
  let wrapper: RenderResult;
  const renderDetailedPrograms = () => {
    spyOn(mockProgramsResource, 'fetchEnrolledPrograms').and.returnValue(of(mockEnrolledProgramsResponse));
    spyOn(mockProgramContext, 'useProgramsContext').and.returnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
    });
    wrapper = render(<ProgramsDetailedSummary />);
  };

  const renderEmptyStatePrograms = () => {
    spyOn(mockProgramsResource, 'fetchEnrolledPrograms').and.returnValue(of([]));
    spyOn(mockProgramContext, 'useProgramsContext').and.returnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
    });
    wrapper = render(<ProgramsDetailedSummary />);
  };

  const renderErrorStateProgram = () => {
    spyOn(mockProgramsResource, 'fetchEnrolledPrograms').and.returnValue(throwError('loading error'));
    spyOn(mockProgramContext, 'useProgramsContext').and.returnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
    });
    wrapper = render(<ProgramsDetailedSummary />);
  };

  it("displays a detailed summary of the patient's program enrollments", async () => {
    renderDetailedPrograms();
    await screen.findByRole('heading', { name: /Care Programs/i });
    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();

    expect(screen.getByText('Active programs')).toBeInTheDocument();
    expect(screen.getByText('Date enrolled')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('HIV Care and Treatment')).toBeInTheDocument();
    expect(screen.getByText('Jan-2020')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders an empty state view when program enrollment data is absent', async () => {
    renderEmptyStatePrograms();
    screen.findByRole('heading', { name: /Care Programs/i });
    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();

    expect(screen.getByText(/There are no program enrollments to display for this patient/)).toBeInTheDocument();
  });

  it('renders an error state, when an error occurs while loading data', () => {
    renderErrorStateProgram();
    expect(screen.getByText(/Care Programs/i)).toBeInTheDocument();

    expect(
      screen.getByText(
        /Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above./,
      ),
    ).toBeInTheDocument();
  });
});
