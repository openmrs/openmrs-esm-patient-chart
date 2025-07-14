import React from 'react';
import { LeftNavMenu, useLayoutType } from '@openmrs/esm-framework';

const SideMenuPanel: React.FC = () => {
  const layout = useLayoutType();

  return layout === 'large-desktop' && <LeftNavMenu />;
};

export default SideMenuPanel;
