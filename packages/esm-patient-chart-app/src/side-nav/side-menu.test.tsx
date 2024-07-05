import React from 'react';
import { render, screen } from '@testing-library/react';
import { LeftNavMenu, useLayoutType } from '@openmrs/esm-framework';
import SideMenu from './side-menu.component';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    isDesktop: jest.fn().mockImplementation((layout) => layout === 'small-desktop' || layout === 'large-desktop'),
  };
});

global.window.matchMedia = jest.fn().mockImplementation(() => {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  };
});

const mockedLeftNavMenu = LeftNavMenu as any as jest.Mock;
const mockedUseLayoutType = useLayoutType as jest.Mock;

mockedLeftNavMenu.mockReturnValue('left nav menu');

describe('sidemenu', () => {
  it('is rendered when viewport == large-desktop', () => {
    mockedUseLayoutType.mockImplementationOnce(() => 'large-desktop');

    renderSideMenu();

    expect(screen.getByText(/left nav menu/)).toBeInTheDocument();
  });

  it('is not rendered when viewport == tablet or viewport == small-desktop', () => {
    mockedUseLayoutType.mockImplementationOnce(() => 'tablet');

    renderSideMenu();

    expect(screen.queryByText(/left nav menu/)).not.toBeInTheDocument();
  });
});

function renderSideMenu() {
  render(<SideMenu />);
}
