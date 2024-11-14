import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchPatientWorkspace } from '..';
import { EmptyState } from '.';

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');

  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('EmptyState', () => {
  it('renders an empty state widget card', () => {
    render(
      <EmptyState
        headerTitle="appointments"
        displayText="appointments"
        launchForm={() => launchPatientWorkspace('sample-form-workspace')}
      />,
    );

    expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no appointments to display for this patient/i)).toBeInTheDocument();
  });

  it('renders a link that launches a form in the workspace when the launchForm prop is provided', async () => {
    const user = userEvent.setup();

    render(
      <EmptyState
        headerTitle="appointments"
        displayText="appointments"
        launchForm={() => launchPatientWorkspace('sample-form-workspace')}
      />,
    );

    const recordAppointmentsLink = screen.getByText(/record appointments/i);
    expect(recordAppointmentsLink).toBeInTheDocument();

    await user.click(recordAppointmentsLink);

    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('sample-form-workspace');
  });
});
