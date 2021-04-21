import React from "react";
import Button from "carbon-components-react/es/components/Button";
import Tab from "carbon-components-react/es/components/Tab";
import Tabs from "carbon-components-react/es/components/Tabs";
import { useTranslation } from "react-i18next";
import {
  attach,
  ExtensionSlot,
  useConfig,
  useCurrentPatient
} from "@openmrs/esm-framework";
import styles from "./clinical-view-overview.component.scss";
import { tail } from "lodash";
import { extensionStore } from "@openmrs/esm-framework";

interface ClinicalViewTab {
  labelName: string;
  slotName?: string;
}

const ClinicalViewOverview: React.FC = () => {
  const { t } = useTranslation();
  const [, patient, patientUuid] = useCurrentPatient();
  const [selectedViewIndex, setSelectedViewIndex] = React.useState(0);
  const [tabLabels, setTabLabels] = React.useState<Array<ClinicalViewTab>>([
    { labelName: "All", slotName: "" },
    { labelName: "Patient Info", slotName: "patient-header-slot" }
  ]);
  const launchClinicalViewForm = React.useCallback(() => {
    attach(
      "patient-chart-workspace-slot",
      "patient-clinical-view-form-workspace"
    );
  }, []);

  const config = useConfig();
  console.log(config);

  const state = React.useMemo(() => {
    return { patient, patientUuid };
  }, [patient, patientUuid]);

  return (
    <div className={styles.clinicalViewContainer}>
      <div className={styles.clinicalViewHeaderContainer}>
        <span className={styles.title}>
          {t("clinicalViews", "Clinical Views")}
        </span>
        <Button kind="ghost" onClick={launchClinicalViewForm}>
          {selectedViewIndex === 0
            ? t("addView", "Add View")
            : t("editView", "Edit View")}
        </Button>
      </div>
      <div>
        <Tabs
          scrollIntoView={false}
          type="container"
          className={styles.tabsContentClass}
          tabContentClassName={styles.tabContentClassName}
          onSelectionChange={event => setSelectedViewIndex(event)}
        >
          {tabLabels.map((tab, index) => (
            <Tab key={index} id={tab.labelName} label={tab.labelName}>
              {selectedViewIndex !== 0 ? (
                <ExtensionSlot extensionSlotName={tab.slotName} state={state} />
              ) : (
                tail(tabLabels).map((tab, index) => (
                  <ExtensionSlot
                    key={tab.labelName}
                    extensionSlotName={tab.slotName}
                    state={state}
                  />
                ))
              )}
            </Tab>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicalViewOverview;
