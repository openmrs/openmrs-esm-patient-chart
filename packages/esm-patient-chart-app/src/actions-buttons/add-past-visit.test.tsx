import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import AddPastVisitOverflowMenuItem from './add-past-visit.component';

const mockShowModal = jest.mocked(showModal);

describe('AddPastVisitOverflowMenuItem', () => {
  it('should launch the start past visit modal', async () => {
    const user = userEvent.setup();

    render(<AddPastVisitOverflowMenuItem />);

    const addPastVisitButton = screen.getByRole('menuitem', { name: /Add past visit/ });
    expect(addPastVisitButton).toBeInTheDocument();

    await user.click(addPastVisitButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith(
      'start-visit-dialog',
      expect.objectContaining({
        launchPatientChart: undefined,
        patientUuid: undefined,
      }),
    );
  });
});
