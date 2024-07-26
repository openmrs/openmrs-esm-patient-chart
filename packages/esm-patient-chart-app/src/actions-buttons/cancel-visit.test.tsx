import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import CancelVisitOverflowMenuItem from './cancel-visit.component';

const mockUseVisit = jest.mocked(useVisit);

describe('CancelVisitOverflowMenuItem', () => {
  it('should launch cancel visit dialog box', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValueOnce({ currentVisit: mockCurrentVisit } as ReturnType<typeof useVisit>);

    render(<CancelVisitOverflowMenuItem patientUuid="some-uuid" />);

    const cancelVisitButton = screen.getByRole('menuitem', { name: /cancel visit/i });
    expect(cancelVisitButton).toBeInTheDocument();

    await user.click(cancelVisitButton);
  });
});
