import React from 'react';
import CancelVisitOverflowMenuItem from './cancel-visit.component';
import { screen, render } from '@testing-library/react';
import { showModal, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import userEvent from '@testing-library/user-event';

const mockUseVisit = useVisit as jest.Mock;
const mockShowModal = showModal as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return { ...originalModule, useVisit: jest.fn(), showModal: jest.fn() };
});

describe('CancelVisitOverflowMenuItem', () => {
  it('should launch cancel visit dialog box', () => {
    mockUseVisit.mockReturnValueOnce({ currentVisit: mockCurrentVisit });
    render(<CancelVisitOverflowMenuItem patientUuid="some-uuid" />);

    const cancelVisitButton = screen.getByRole('menuitem', { name: /Cancel visit/ });
    expect(cancelVisitButton).toBeInTheDocument();

    userEvent.click(cancelVisitButton);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
});
