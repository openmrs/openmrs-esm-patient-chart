import React, { useCallback } from "react";
import { Notification20, ShoppingBag20, Document20 } from "@carbon/icons-react";
import Button from "carbon-components-react/es/components/Button";
import { HeaderPanel } from "carbon-components-react";

import styles from "./action-menu.scss";
import {
  ActionMenuHookState,
  ActionMenuTypes,
} from "../hooks/useActionMenuState";
import { isDesktop } from "../utils";
import { useLayoutType } from "@openmrs/esm-framework";

interface ActionMenuInterface {
  config: ActionMenuHookState;
}

export const ActionMenu: React.FC<ActionMenuInterface> = ({ config }) => {
  const layout = useLayoutType();
  const createToggle = (type: ActionMenuTypes) => () =>
    config.setActionMenuState(
      config.state.type === type ? config.defaultState : { type }
    );
  const onNotificationsClick = useCallback(
    createToggle(ActionMenuTypes.NOTIFICATIONS),
    [config.state.type]
  );
  const onCartClick = useCallback(createToggle(ActionMenuTypes.CART), [
    config.state.type,
  ]);
  const onDocumentsClick = useCallback(
    createToggle(ActionMenuTypes.DOCUMENTS),
    [config.state.type]
  );

  return (
    isDesktop(layout) && (
      <>
        <aside className={styles.rightSideNav}>
          <Button
            onClick={onNotificationsClick}
            iconDescription="Notifications"
            className={styles.iconButton}
            kind="ghost"
            hasIconOnly
          >
            <Notification20 aria-label="Notifications" />
          </Button>
          <Button
            onClick={onCartClick}
            iconDescription="Cart"
            className={styles.iconButton}
            kind="ghost"
            hasIconOnly
          >
            <ShoppingBag20 aria-label="Cart" />
          </Button>
          <Button
            onClick={onDocumentsClick}
            iconDescription="Documents"
            className={styles.iconButton}
            kind="ghost"
            hasIconOnly
          >
            <Document20 aria-label="Documents" />
          </Button>
        </aside>
        <HeaderPanel
          className={styles.actionPanel}
          expanded={!!config?.state.type}
        >
          {/* Drawer main content goes inside here */}
        </HeaderPanel>
      </>
    )
  );
};

export default ActionMenu;
