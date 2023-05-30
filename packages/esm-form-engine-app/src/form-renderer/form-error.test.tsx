import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

import FormError from './form-error.component';

const mockLaunchPatientWorkspace = launchPatientWorkspace as jest.Mock;

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
}));

describe('FormError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const closeWorkspace = jest.fn();
    render(<FormError closeWorkspace={closeWorkspace} />);
    expect(screen.getByText('There was an error with this form')).toBeInTheDocument();
    expect(screen.getByText('Try opening another form from')).toBeInTheDocument();
    expect(screen.getByText('this list')).toBeInTheDocument();
    expect(screen.getByText('Close this panel')).toBeInTheDocument();
  });

  test('calls the closeWorkspace function when the button is clicked', () => {
    const closeWorkspace = jest.fn();
    render(<FormError closeWorkspace={closeWorkspace} />);
    const closeButton = screen.getByRole('button', { name: /close this panel/i });
    fireEvent.click(closeButton);
    expect(closeWorkspace).toHaveBeenCalled();
  });

  test('calls the closeWorkspace and opens the form dashboard function when the this `list` is clicked', () => {
    const closeWorkspace = jest.fn();
    render(<FormError closeWorkspace={closeWorkspace} />);
    const link = screen.getByRole('button', { name: /this list/i });
    fireEvent.click(link);
    expect(closeWorkspace).toHaveBeenCalled();
    expect(mockLaunchPatientWorkspace).toHaveBeenCalledWith('clinical-forms-workspace');
  });
});
