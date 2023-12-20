import React from 'react';
import CancelVisitOverflowMenuItem from './cancel-visit.component';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '__mocks__';

const mockUseVisit = useVisit as jest.Mock;
const mockShowModal = showModal as jest.Mock;

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

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
});
