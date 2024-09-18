import React from 'react';
import { LeftNavMenu, useLayoutType } from '@openmrs/esm-framework';

interface SideMenuPanelProps extends SideNavProps {}

const SideMenuPanel: React.FC<SideMenuPanelProps> = () => {
  const layout = useLayoutType();

  return layout === 'large-desktop' && <LeftNavMenu />;
};

export default SideMenuPanel;
