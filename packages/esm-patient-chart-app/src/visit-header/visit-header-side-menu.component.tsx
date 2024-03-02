import React, { useEffect } from 'react';
import { LeftNavMenu, useOnClickOutside } from '@openmrs/esm-framework';

interface VisitHeaderSideMenuProps {
  isExpanded: boolean;
  toggleSideMenu: (isExpanded: boolean) => void;
}

const VisitHeaderSideMenu: React.FC<VisitHeaderSideMenuProps> = ({ isExpanded, toggleSideMenu }) => {
  const menuRef = useOnClickOutside(() => toggleSideMenu(false), isExpanded);

  useEffect(() => {
    const popstateHandler = () => toggleSideMenu(false);

    window.addEventListener('popstate', popstateHandler);

    return () => window.removeEventListener('popstate', popstateHandler);
  }, [toggleSideMenu]);

  return isExpanded ? <LeftNavMenu ref={menuRef} /> : null;
};

export default VisitHeaderSideMenu;
