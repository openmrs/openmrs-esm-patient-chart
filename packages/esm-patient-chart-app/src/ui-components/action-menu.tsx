import React, { useCallback } from "react";
import { ExtensionSlot, useLayoutType } from "@openmrs/esm-framework";
import Button from "carbon-components-react/es/components/Button";
import { HeaderPanel } from "carbon-components-react";

import { Edit20 } from "@carbon/icons-react";
import styles from "./action-menu.scss";
import { isDesktop } from "../utils";

interface ActionMenuInterface {
  open: boolean;
}

export const CHARTS_DRAWER_SLOT = "drawer-slot";
export const CHARTS_ACTION_MENU_ITEMS_SLOT = "action-menu-items-slot";

export const ActionMenu: React.FC<ActionMenuInterface> = ({ open }) => {
  const layout = useLayoutType();

  const menu = isDesktop(layout) ? (
    <aside className={styles.rightSideNav}>
      <ExtensionSlot extensionSlotName={CHARTS_ACTION_MENU_ITEMS_SLOT} />
    </aside>
  ) : (
    <button className={styles.actionBtn}>
      <Edit20 />
    </button>
  );

  return (
    <>
      {menu}
      <HeaderPanel className={styles.actionPanel} expanded={open}>
        <ExtensionSlot extensionSlotName={CHARTS_DRAWER_SLOT} />
        {/* Drawer main content goes inside here */}
      </HeaderPanel>
    </>
  );
};

export default ActionMenu;
