import React from 'react';
import { render, screen } from '@testing-library/react';
import { isDesktop, LeftNavMenu, useLayoutType } from '@openmrs/esm-framework';
import SideMenu from './side-menu.component';

const mockIsDesktop = jest.mocked(isDesktop);
const mockedLeftNavMenu = LeftNavMenu as unknown as jest.Mock;
const mockedUseLayoutType = jest.mocked(useLayoutType);

mockedLeftNavMenu.mockReturnValue('left nav menu');

describe('sidemenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockIsDesktop.mockImplementation((layout) => layout === 'small-desktop' || layout === 'large-desktop');
  });
  it('is rendered when viewport == large-desktop', () => {
    mockedUseLayoutType.mockImplementationOnce(() => 'large-desktop');

    renderSideMenu();

    expect(screen.getByText(/left nav menu/i)).toBeInTheDocument();
  });

  it('is not rendered when viewport == tablet or viewport == small-desktop', () => {
    mockedUseLayoutType.mockImplementationOnce(() => 'tablet');

    renderSideMenu();

    expect(screen.queryByText(/left nav menu/i)).not.toBeInTheDocument();
  });
});

function renderSideMenu() {
  render(<SideMenu />);
}
