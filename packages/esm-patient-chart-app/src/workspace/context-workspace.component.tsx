import React from "react";
import Close32 from "@carbon/icons-react/es/close/32";
import styles from "./context-workspace.css";
import { useTranslation } from "react-i18next";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName
} from "carbon-components-react/es/components/UIShell";
import { ExtensionSlotProps } from "@openmrs/esm-framework";

export interface ContextWorkspaceProps {
  title: string;
  extensionSlot?: React.FC<ExtensionSlotProps>;
  clearExtensionSlot: () => void;
}

export default function ContextWorkspace({
  title,
  extensionSlot,
  clearExtensionSlot
}: ContextWorkspaceProps) {
  const { t } = useTranslation();

  return extensionSlot ? (
    <aside className={styles.contextWorkspaceContainer}>
      <Header
        aria-label={t("orderBasket", "Order Basket")}
        style={{ position: "sticky" }}
      >
        <HeaderName prefix="">{title}</HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label={t("close", "Close")}
            title={t("close", "Close")}
            onClick={clearExtensionSlot}
          >
            <Close32 />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      {extensionSlot}
    </aside>
  ) : (
    <></>
  );
}
