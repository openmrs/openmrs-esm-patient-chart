import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';
import CancelVisitOverflowMenuItem from './cancel-visit.component';

const mockUseVisit = useVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return { ...originalModule, useVisit: jest.fn(), showModal: jest.fn() };
});

describe('CancelVisitOverflowMenuItem', () => {
  it('should launch cancel visit dialog box', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValueOnce({ currentVisit: mockCurrentVisit });

    render(<CancelVisitOverflowMenuItem patientUuid="some-uuid" />);

    const cancelVisitButton = screen.getByRole('menuitem', { name: /Cancel visit/ });
    expect(cancelVisitButton).toBeInTheDocument();

    await user.click(cancelVisitButton);
  });
});
