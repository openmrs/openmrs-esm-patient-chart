import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useClinicalView } from '../store';
import ClinicalViewForm from './clinical-view-form.component';

const mockUseClinicalView = useClinicalView as jest.Mock;

jest.mock('lodash-es/isEmpty', () => jest.fn((arr) => arr.length === 0));

jest.mock('../store', () => ({
  useClinicalView: jest.fn(),
}));

const mockClinicalViews = {
  views: [
    { slotName: 'Breadcrumbs', slot: 'breadcrumbs-slot', checked: false },
    { slotName: 'Top Nav Actions', slot: 'top-nav-actions-slot', checked: false },
    { slotName: 'User Panel', slot: 'user-panel-slot', checked: true },
    { slotName: 'App Menu', slot: 'app-menu-slot', checked: false },
  ],
  clinicalViews: [{ slot: 'All', slotName: '' }],
};

const testProps = {
  patientUuid: 'abc-123',
  closeWorkspace: jest.fn(),
};

describe('<ClinicalViewForm/>', () => {
  beforeEach(() => {
    testProps.closeWorkspace.mockReset();
    mockUseClinicalView.mockReturnValue(mockClinicalViews);
    render(<ClinicalViewForm {...testProps} />);
  });

  it('should be able to perform search on form', () => {
    expect(screen.getByRole('checkbox', { name: /Breadcrumbs/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Top Nav Actions/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /User Panel/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /App Menu/i })).toBeInTheDocument();

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save & Close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();

    // Should be able to search for slots
    const searchInput = screen.getByRole('search');
    userEvent.type(searchInput, 'App Menu');
    expect(screen.getByRole('checkbox', { name: /App Menu/i })).toBeInTheDocument();
  });

  it('should be able to reset form to initial state', () => {
    const appMenuSlot = screen.getByRole('checkbox', { name: /App Menu/ });
    expect(appMenuSlot).toBeInTheDocument();
    expect(appMenuSlot).not.toBeChecked();

    const userPanel = screen.getByRole('checkbox', { name: /User Panel/i });
    expect(userPanel).toBeChecked();

    userEvent.click(appMenuSlot);
    expect(appMenuSlot).toBeChecked();

    userEvent.click(userPanel);
    expect(userPanel).not.toBeChecked();

    const resetButton = screen.getByRole('button', { name: /Reset/i });
    userEvent.click(resetButton);

    expect(appMenuSlot).not.toBeChecked();
    expect(userPanel).toBeChecked();
  });

  it('should close the form on cancel button click', () => {
    const closeButton = screen.getByRole('button', { name: /Close/i });
    userEvent.click(closeButton);
    expect(testProps.closeWorkspace).toHaveBeenCalled();
  });
});
