import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clinicalFormsWorkspace, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import FormError from './form-error.component';

const mocklaunchPatientWorkspace = jest.mocked(launchPatientWorkspace);

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
}));

describe('FormError', () => {
  test('renders correctly', () => {
    const closeWorkspace = jest.fn();

    render(<FormError closeWorkspace={closeWorkspace} />);

    expect(screen.getByText('There was an error with this form')).toBeInTheDocument();
    expect(screen.getByText('Try opening another form from')).toBeInTheDocument();
    expect(screen.getByText('this list')).toBeInTheDocument();
    expect(screen.getByText('Close this panel')).toBeInTheDocument();
  });

  test('calls the closeWorkspace function when the button is clicked', async () => {
    const user = userEvent.setup();
    const closeWorkspace = jest.fn();

    render(<FormError closeWorkspace={closeWorkspace} />);

    const closeButton = screen.getByRole('button', { name: /close this panel/i });

    await user.click(closeButton);

    expect(closeWorkspace).toHaveBeenCalled();
  });

  test('calls the closeWorkspace and opens the form dashboard function when the this `list` is clicked', async () => {
    const user = userEvent.setup();
    const closeWorkspace = jest.fn();

    render(<FormError closeWorkspace={closeWorkspace} />);

    const link = screen.getByRole('button', { name: /this list/i });

    await user.click(link);

    expect(closeWorkspace).toHaveBeenCalled();
    expect(mocklaunchPatientWorkspace).toHaveBeenCalledWith(clinicalFormsWorkspace);
  });
});
