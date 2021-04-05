import React, { useEffect } from "react";
import { SideNav } from "carbon-components-react/es/components/UIShell";
import { SideNavProps } from "carbon-components-react";
import { ExtensionSlot, useLayoutType } from "@openmrs/esm-framework";
import styles from "./side-menu.component.scss";
import { isTablet } from "../utils";

interface SideMenuPanelProps extends SideNavProps {}

const LAYOUT_CSS_CLASS = "omrs-sidenav-expanded";

const SideMenuPanel: React.FC<SideMenuPanelProps> = () => {
  const layout = useLayoutType();

  useEffect(() => {
    if (isTablet(layout)) {
      document.querySelector("body").classList.remove(LAYOUT_CSS_CLASS);
    } else {
      document.querySelector("body").classList.add(LAYOUT_CSS_CLASS);
    }
    return () =>
      document.querySelector("body").classList.remove(LAYOUT_CSS_CLASS);
  }, [layout]);

  return (
    !isTablet(layout) && (
      <SideNav expanded aria-label="Menu" className={styles.link}>
        <ExtensionSlot extensionSlotName="nav-menu" />
      </SideNav>
    )
  );
};

export default SideMenuPanel;
