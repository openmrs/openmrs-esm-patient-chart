import React from 'react';
import StopVisitOverflowMenuItem from './stop-visit.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import { mockPatient } from 'tools';

const mockUseVisit = jest.mocked(useVisit);
const mockShowModal = jest.mocked(showModal);

describe('StopVisitOverflowMenuItem', () => {
  it('should be able to stop active visit', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({ activeVisit: mockCurrentVisit } as ReturnType<typeof useVisit>);

    render(<StopVisitOverflowMenuItem patientUuid={mockPatient.id} />);

    const endVisitButton = screen.getByRole('menuitem', { name: /End active visit/i });
    expect(endVisitButton).toBeInTheDocument();

    await user.click(endVisitButton);
    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
});
