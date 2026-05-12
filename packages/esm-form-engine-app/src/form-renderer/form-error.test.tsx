import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormError from './form-error.component';

vi.mock('@openmrs/esm-patient-common-lib', () => ({
  launchWorkspace: vi.fn(),
}));

describe('FormError', () => {
  test('renders correctly', () => {
    const closeWorkspace = vi.fn();

    render(<FormError closeWorkspace={closeWorkspace} />);

    expect(screen.getByText('There was an error with this form')).toBeInTheDocument();
    expect(screen.getByText('Try opening another form from')).toBeInTheDocument();
    expect(screen.getByText('this list')).toBeInTheDocument();
    expect(screen.getByText('Close this panel')).toBeInTheDocument();
  });

  test('calls the closeWorkspace function when the button is clicked', async () => {
    const user = userEvent.setup();
    const closeWorkspace = vi.fn();

    render(<FormError closeWorkspace={closeWorkspace} />);

    const closeButton = screen.getByRole('button', { name: /close this panel/i });

    await user.click(closeButton);

    expect(closeWorkspace).toHaveBeenCalled();
  });

  test('calls the closeWorkspace and opens the form dashboard function when the this `list` is clicked', async () => {
    const user = userEvent.setup();
    const closeWorkspace = vi.fn();

    render(<FormError closeWorkspace={closeWorkspace} />);

    const link = screen.getByRole('button', { name: /this list/i });

    await user.click(link);

    expect(closeWorkspace).toHaveBeenCalled();
  });
});
