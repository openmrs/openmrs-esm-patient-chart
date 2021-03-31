import React, { useMemo } from "react";
import WorkspaceWrapper from "../workspace/workspace-wrapper.component";
import ChartReview from "../chart-review/chart-review.component";
import styles from "./patient-chart.component.scss";
import VisitDialog from "../visit/visit-dialog.component";
import Loader from "./loader.component";
import { Route, RouteComponentProps } from "react-router-dom";
import { ExtensionSlot, useCurrentPatient } from "@openmrs/esm-framework";
import { dashboardPath } from "../constants";

interface PatientChartParams {
  patientUuid: string;
}

const PatientChart: React.FC<RouteComponentProps<PatientChartParams>> = ({
  match,
}) => {
  const patientUuid = match.params.patientUuid;
  const [loading, patient] = useCurrentPatient(patientUuid);
  const state = useMemo(() => {
    return { patient, patientUuid };
  }, [patient, patientUuid]);

  return (
    <main
      className="omrs-main-content"
      style={{
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
      }}
    >
      {loading ? (
        <Loader />
      ) : (
        <>
          <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
          <aside className={styles.patientBanner}>
            <ExtensionSlot
              extensionSlotName="patient-header-slot"
              state={state}
            />
            <ExtensionSlot
              extensionSlotName="patient-info-slot"
              state={state}
            />
          </aside>
          <div className={styles.grid}>
            <div className={styles.chartreview}>
              <Route path={dashboardPath} component={ChartReview} />
              <Route path={dashboardPath} component={VisitDialog} />
            </div>
            <div className={styles.workspace}>
              <Route path={dashboardPath} component={WorkspaceWrapper} />
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default PatientChart;
