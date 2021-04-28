import React from "react";
import Button from "carbon-components-react/es/components/Button";
import Tab from "carbon-components-react/es/components/Tab";
import Tabs from "carbon-components-react/es/components/Tabs";
import { useTranslation } from "react-i18next";
import {
  attach,
  ExtensionSlot,
  useConfig,
  useCurrentPatient,
} from "@openmrs/esm-framework";
import styles from "./clinical-view-overview.component.scss";
import { tail } from "lodash";
import isEmpty from "lodash-es/isEmpty";

const ClinicalViewOverview: React.FC = () => {
  const config = useConfig();
  const { t } = useTranslation();
  const [, patient, patientUuid] = useCurrentPatient();
  const [selectedViewIndex, setSelectedViewIndex] = React.useState(0);
  const launchClinicalViewForm = React.useCallback(() => {
    attach(
      "patient-chart-workspace-slot",
      "patient-clinical-view-form-workspace"
    );
  }, []);

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
        {!isEmpty(state) && (
          <Tabs
            scrollIntoView={false}
            type="container"
            className={styles.tabsContentClass}
            tabContentClassName={styles.tabContentClassName}
            onSelectionChange={(event) => setSelectedViewIndex(event)}
          >
            {config.clinicalViews.map((tab, index) => (
              <Tab key={index} id={tab.slot} label={tab.slot}>
                {selectedViewIndex !== 0 ? (
                  <ExtensionSlot
                    extensionSlotName={tab.slotName}
                    state={state}
                  />
                ) : (
                  tail(config.clinicalViews).map((tab: any, index) => (
                    <ExtensionSlot
                      key={tab.slot}
                      extensionSlotName={tab.slotName}
                      state={state}
                    />
                  ))
                )}
              </Tab>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ClinicalViewOverview;
