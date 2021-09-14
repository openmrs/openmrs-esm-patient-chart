import React from 'react';
import StartVisitOverflowMenuItem from './start-visit.component';
import { useVisit, attach } from '@openmrs/esm-framework';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockUseVisit = useVisit as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  useVisit: jest.fn(),
  attach: jest.fn(),
}));

describe('StartVisitOverflowMenuItem', () => {
  it('should launch start visit form', () => {
    mockUseVisit.mockReturnValue({ currentVisit: null });
    render(<StartVisitOverflowMenuItem patientUuid="some-patient-uuid" />);

    const startVisitButton = screen.getByRole('menuitem', { name: /Start visit/ });
    expect(startVisitButton).toBeInTheDocument();

    userEvent.click(startVisitButton);

    expect(attach).toHaveBeenCalledTimes(1);
    expect(attach).toHaveBeenCalledWith('patient-chart-workspace-slot', 'start-visit-workspace-form');
  });
});
