import React from 'react';
import { render, screen } from '@testing-library/react';
import VisitQueueEntryDetails from './visit-queue-entry-details.component';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';
import { STATUS, PRIORITY } from '../constants';

const mockedShowModal = jest.mocked(showModal);

const testProps = {
  queueEntry: {
    service: 'Test Service',
    status: STATUS.IN_SERVICE,
  },
  priority: PRIORITY.EMERGENCY,
};

describe('VisitQueueEntryDetails', () => {
  it('displays the correct service message', () => {
    renderVisitQueueEntryDetails();

    expect(screen.getByText(`Attending ${testProps.queueEntry.service}`)).toBeInTheDocument();
  });

  it('displays the correct tag type based on the visit priority', () => {
    renderVisitQueueEntryDetails();

    const attendingService = screen.getByText(`Attending ${testProps.queueEntry.service}`);
    expect(attendingService).toBeInTheDocument();

    const emergencyTag = screen.getByText(testProps.priority);
    expect(emergencyTag).toBeInTheDocument();
  });

  it('calls showModal on edit button click', async () => {
    const user = userEvent.setup();

    renderVisitQueueEntryDetails();

    const moveToNextServiceButton = screen.getByRole('button', { name: /move to next service/i });
    expect(moveToNextServiceButton).toBeInTheDocument();

    await user.click(moveToNextServiceButton);

    expect(mockedShowModal).toHaveBeenCalled();

    expect(mockedShowModal).toHaveBeenCalledWith(
      'edit-queue-entry-status-modal',
      expect.objectContaining({
        queueEntry: {
          service: 'Test Service',
          status: 'in service',
        },
      }),
    );
  });
});

function renderVisitQueueEntryDetails() {
  render(<VisitQueueEntryDetails {...testProps} />);
}
