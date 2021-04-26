import React from "react";
import Close32 from "@carbon/icons-react/es/close/32";
import styles from "./context-workspace.css";
import { ExtensionSlot } from "@openmrs/esm-framework";
import { RouteComponentProps } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderName,
} from "carbon-components-react/es/components/UIShell";
import { useWorkspace } from "../hooks/useWorkspace";
import { patientChartWorkspaceSlot } from "../constants";

interface ContextWorkspaceParams {
  patientUuid: string;
}

const ContextWorkspace: React.FC<
  RouteComponentProps<ContextWorkspaceParams>
> = ({ match }) => {
  const { patientUuid } = match.params;
  const { active, title, clearExtensionSlot } = useWorkspace();
  const { t } = useTranslation();
  const props = React.useMemo(
    () => ({ closeWorkspace: clearExtensionSlot, patientUuid }),
    [clearExtensionSlot, patientUuid]
  );

  return (
    <aside
      className={styles.contextWorkspaceContainer}
      style={{ visibility: active ? "visible" : "collapse" }}
    >
      <Header aria-label={title} style={{ position: "sticky" }}>
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
      <ExtensionSlot
        extensionSlotName={patientChartWorkspaceSlot}
        state={props}
      />
    </aside>
  );
};

export default ContextWorkspace;
