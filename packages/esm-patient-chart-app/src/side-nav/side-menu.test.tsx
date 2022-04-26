import React from 'react';
import SideMenu from './side-menu.component';
import { render } from '@testing-library/react';
import { LeftNavMenu, useLayoutType } from '@openmrs/esm-framework';
global.window.matchMedia = jest.fn().mockImplementation(() => {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {},
  };
});

const mockUseLayoutType = useLayoutType as jest.Mock;
const mockLeftNavMenu = LeftNavMenu as any as jest.Mock;

mockLeftNavMenu.mockReturnValue('left nav menu');

describe('sidemenu', () => {
  it('is rendered when viewport != tablet', () => {
    mockUseLayoutType.mockImplementationOnce(() => 'desktop');
    expect(render(<SideMenu />).getByText(/left nav menu/)).toBeTruthy();
  });

  it('is not rendered when viewport == tablet', () => {
    mockUseLayoutType.mockImplementationOnce(() => 'tablet');
    expect(render(<SideMenu />).queryAllByText(/left nav menu/)).toHaveLength(0);
  });
});
