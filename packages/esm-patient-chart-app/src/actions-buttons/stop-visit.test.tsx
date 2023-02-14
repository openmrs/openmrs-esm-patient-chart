import React from 'react';
import StopVisitOverflowMenuItem from './stop-visit.component';
import { screen, render, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal, useConfig, useVisit } from '@openmrs/esm-framework';
import { mockCurrentVisit } from '../../../../__mocks__/visits.mock';
import { mockPatient } from '../../../../__mocks__/patient.mock';

const mockUseVisit = useVisit as jest.Mock;
const mockShowModal = showModal as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  useVisit: jest.fn(),
  showModal: jest.fn(),
  useConfig: jest.fn(),
}));

describe('StopVisitOverflowMenuItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  it('should be able to stop current visit', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
    mockUseConfig.mockReturnValue({ endVisitLabel: '' });

    render(<StopVisitOverflowMenuItem patientUuid={mockPatient.id} />);

    const endVisitButton = screen.getByRole('menuitem', { name: /End Visit/i });
    expect(endVisitButton).toBeInTheDocument();

    // should launch the form
    await user.click(endVisitButton);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
  it('should be able to show configured label in button to stop current visit', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({ currentVisit: mockCurrentVisit });
    mockUseConfig.mockReturnValue({ endVisitLabel: 'Checkout' });

    render(<StopVisitOverflowMenuItem patientUuid={mockPatient.id} />);

    const endVisitButton = screen.getByRole('menuitem', { name: /Checkout/ });
    expect(endVisitButton).toBeInTheDocument();

    // should launch the form
    await user.click(endVisitButton);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });
});
