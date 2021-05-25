import React from 'react';
import SideMenu from './side-menu.component';
import { render } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn(() => 'tablet'),
  ExtensionSlot: jest.fn(() => <div>rendered</div>),
  attach: jest.fn(),
  detach: jest.fn(),
}));

jest.mock('./side-menu.component.scss', () => ({}));

describe('sidemenu', () => {
  it('is rendered when not viewport != tablet', () => {
    (useLayoutType as jest.Mock).mockImplementationOnce(() => 'desktop');
    expect(render(<SideMenu />).getByText('rendered')).toBeTruthy();
  });

  it('is not rendered when not viewport != tablet', () => {
    (useLayoutType as jest.Mock).mockImplementationOnce(() => 'tablet');
    expect(render(<SideMenu />).queryAllByText('rendered')).toHaveLength(0);
  });
});
