import React from "react";
import {
  SideNav,
  SideNavProps
} from "carbon-components-react/es/components/UIShell";
import { ExtensionSlot, useLayoutType } from "@openmrs/esm-framework";
import styles from "./side-menu.component.scss";
import { isDesktop } from "../utils";

interface SideMenuPanelProps extends SideNavProps {}

const LAYOUT_CSS_CLASS = "omrs-sidenav-expanded";

const SideMenuPanel: React.FC<SideMenuPanelProps> = () => {
  const layout = useLayoutType();

  return (
    isDesktop(layout) && (
      <SideNav expanded aria-label="Menu" className={styles.link}>
        <ExtensionSlot extensionSlotName="nav-menu-slot" />
      </SideNav>
    )
  );
};

export default SideMenuPanel;
