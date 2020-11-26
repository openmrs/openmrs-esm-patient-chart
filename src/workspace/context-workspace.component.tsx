import React from "react";
import { useTranslation } from "react-i18next";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName
} from "carbon-components-react";
import { Close32 } from "@carbon/icons-react";
import { ExtensionSlotProps } from "@openmrs/esm-react-utils";
import styles from "./context-workspace.css";

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
