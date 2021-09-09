import React from 'react';
import AddPastVisitOverflowMenuItem from './add-past-visit.component';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockDispatchEvent = jest.spyOn(window, 'dispatchEvent');
describe('AddPastVisitOverflowMenuItem', () => {
  it('should launch past visit prompt', () => {
    render(<AddPastVisitOverflowMenuItem />);

    const addPastVisitButton = screen.getByRole('menuitem', { name: /Add Past Visit/ });
    expect(addPastVisitButton).toBeInTheDocument();

    // should launch the form
    userEvent.click(addPastVisitButton);

    expect(mockDispatchEvent).toHaveBeenCalledTimes(1);
  });
});
