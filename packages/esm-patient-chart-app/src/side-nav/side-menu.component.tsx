import React from 'react';
import { SideNavProps } from '@carbon/react';
import { LeftNavMenu, useLayoutType } from '@openmrs/esm-framework';
import { isDesktop } from '../utils';

interface SideMenuPanelProps extends SideNavProps {}

const SideMenuPanel: React.FC<SideMenuPanelProps> = () => {
  const layout = useLayoutType();

  return layout === 'large-desktop' && <LeftNavMenu />;
};

export default SideMenuPanel;
