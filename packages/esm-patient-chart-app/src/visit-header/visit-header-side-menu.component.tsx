import React from 'react';
import { LeftNavMenu, useOnClickOutside } from '@openmrs/esm-framework';

interface VisitHeaderSideMenu {
  isExpanded: boolean;
  toggleSideMenu: (state?: boolean) => void;
}

const VisitHeaderSideMenu: React.FC<VisitHeaderSideMenu> = ({ isExpanded, toggleSideMenu }) => {
  const menuRef = useOnClickOutside(() => toggleSideMenu(), isExpanded);

  React.useEffect(() => {
    window.addEventListener('popstate', () => toggleSideMenu(false));
    return () => window.addEventListener('popstate', () => toggleSideMenu(false));
  }, [toggleSideMenu]);

  return isExpanded ? <LeftNavMenu ref={menuRef} /> : null;
};

export default VisitHeaderSideMenu;
