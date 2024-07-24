import React from 'react';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import SideMenu from './side-menu.component';

const mockUseLayoutType = jest.mocked(useLayoutType);

describe('Side menu', () => {
  it('is rendered when viewport == large-desktop', () => {
    mockUseLayoutType.mockReturnValue('large-desktop');
    renderSideMenu();

    expect(screen.getByText(/left nav menu/i)).toBeInTheDocument();
  });

  it('is not rendered when viewport == tablet or viewport == small-desktop', () => {
    mockUseLayoutType.mockReturnValue('tablet');
    renderSideMenu();

    expect(screen.queryByText(/left nav menu/i)).not.toBeInTheDocument();
  });
});

function renderSideMenu() {
  render(<SideMenu />);
}
