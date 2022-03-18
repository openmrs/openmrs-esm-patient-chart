import React from 'react';
import SideMenu from './side-menu.component';
import { render } from '@testing-library/react';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';
global.window.matchMedia = jest.fn().mockImplementation(() => {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {},
  };
});

const mockExtensionSlot = ExtensionSlot as jest.Mock;
mockExtensionSlot.mockImplementation(() => <div>rendered</div>);

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLayoutType: jest.fn(() => 'tablet'),
    ExtensionSlot: jest.fn(() => <div>rendered</div>),
  };
});

jest.mock('./side-menu.component.scss', () => ({}));

describe('sidemenu', () => {
  it('is rendered when viewport != tablet', () => {
    (useLayoutType as jest.Mock).mockImplementationOnce(() => 'desktop');
    expect(render(<SideMenu />).getByText('rendered')).toBeTruthy();
  });

  it('is not rendered when viewport == tablet', () => {
    (useLayoutType as jest.Mock).mockImplementationOnce(() => 'tablet');
    expect(render(<SideMenu />).queryAllByText('rendered')).toHaveLength(0);
  });
});
