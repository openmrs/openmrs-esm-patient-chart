import React from 'react';
import StopVisitOverflowMenuItem from './stop-visit.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';

const mockUseVisit = useVisit as jest.Mock;
const mockShowModal = showModal as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  useVisit: jest.fn(),
  showModal: jest.fn(),
}));

describe('StopVisitOverflowMenuItem', () => {
  it('should be able to stop current visit', () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
    render(<StopVisitOverflowMenuItem patientUuid="some-patient-uuid" />);

    const endVisitButton = screen.getByRole('menuitem', { name: /End Visit/ });
    expect(endVisitButton).toBeInTheDocument();

    // should launch the form
    userEvent.click(endVisitButton);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
});
