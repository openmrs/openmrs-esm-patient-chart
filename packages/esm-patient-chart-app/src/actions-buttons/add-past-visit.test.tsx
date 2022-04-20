import React from 'react';
import AddPastVisitOverflowMenuItem from './add-past-visit.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showModal } from '@openmrs/esm-framework';

const mockShowModal = showModal as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return { originalModule, showModal: jest.fn() };
});

describe('AddPastVisitOverflowMenuItem', () => {
  it('should launch past visit prompt', () => {
    render(<AddPastVisitOverflowMenuItem />);

    const addPastVisitButton = screen.getByRole('menuitem', { name: /Add Past Visit/ });
    expect(addPastVisitButton).toBeInTheDocument();

    // should launch the form
    userEvent.click(addPastVisitButton);
    expect(mockShowModal).toHaveBeenCalled();
  });
});
