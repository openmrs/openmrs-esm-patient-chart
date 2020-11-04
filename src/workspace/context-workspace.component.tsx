import React from "react";
import { useTranslation } from "react-i18next";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName
} from "carbon-components-react";
import { Close32 } from "@carbon/icons-react";
import { ExtensionSlotReactProps } from "@openmrs/esm-extensions/src/extension-slot-react.component";
import styles from "./context-workspace.css";

export interface ContextWorkspaceProps {
  extensionSlot?: React.FC<ExtensionSlotReactProps>;
  clearExtensionSlot: () => void;
}

export default function ContextWorkspace({
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
        <HeaderName prefix="">
          <>
            {/* TODO: Here, the header string should be inserted. This ideally comes from the extension itself. */}
          </>
        </HeaderName>
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
