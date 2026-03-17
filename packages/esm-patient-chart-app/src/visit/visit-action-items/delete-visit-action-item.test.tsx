import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, type Visit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import DeleteVisitActionItem from './delete-visit-action-item.component';

const mockShowModal = jest.mocked(showModal);

describe('DeleteVisitActionItem', () => {
  it('renders a delete visit button when the visit has no encounters', () => {
    render(<DeleteVisitActionItem patientUuid="some-uuid" visit={mockCurrentVisit} />);

    expect(screen.getByRole('button', { name: /delete visit/i })).toBeInTheDocument();
  });

  it('renders a compact icon button when compact is true', () => {
    render(<DeleteVisitActionItem patientUuid="some-uuid" visit={mockCurrentVisit} compact />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('renders nothing when the visit has encounters', () => {
    const visitWithEncounters = {
      ...mockCurrentVisit,
      encounters: [{ uuid: 'enc-1' }],
    } as Visit;

    const { container } = render(<DeleteVisitActionItem patientUuid="some-uuid" visit={visitWithEncounters} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens the delete visit modal with the visit when clicked', async () => {
    const user = userEvent.setup();
    mockShowModal.mockReturnValue(jest.fn());

    render(<DeleteVisitActionItem patientUuid="some-uuid" visit={mockCurrentVisit} />);

    await user.click(screen.getByRole('button', { name: /delete visit/i }));

    expect(mockShowModal).toHaveBeenCalledWith('delete-visit-dialog', {
      visit: mockCurrentVisit,
      closeModal: expect.any(Function),
    });
  });
});
