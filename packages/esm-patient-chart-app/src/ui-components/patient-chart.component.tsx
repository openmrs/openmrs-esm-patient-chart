import React, { useMemo, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { ExtensionSlot, useCurrentPatient } from "@openmrs/esm-framework";

import styles from "./patient-chart.component.scss";
import Loader from "./loader.component";
import WorkspaceWrapper from "../workspace/workspace-wrapper.component";
import ChartReview from "../view-components/chart-review.component";
import VisitDialog from "../visit/visit-dialog.component";
import { useVisitDialog } from "../hooks/useVisitDialog";
import ActionMenu from "./action-menu";

interface PatientChartParams {
  patientUuid: string;
  view: string;
  subview: string;
}

const PatientChart: React.FC<RouteComponentProps<PatientChartParams>> = ({
  match,
}) => {
  const { patientUuid, view, subview } = match.params;
  const [loading, patient] = useCurrentPatient(patientUuid);
  const state = useMemo(() => ({ patient, patientUuid }), [
    patient,
    patientUuid,
  ]);

  const mainClassName = `
    omrs-main-content 
    ${styles.chartContainer} 
  `;

  useVisitDialog(patientUuid);

  return (
    <main className={mainClassName}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.innerChartContainer}>
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
                <ChartReview {...state} view={view} subview={subview} />
                <VisitDialog />
              </div>
              <div className={styles.workspace}>
                <WorkspaceWrapper {...state} />
              </div>
            </div>
          </div>
          {/* sidebar */}
          <ActionMenu open={false} />
        </>
      )}
    </main>
  );
};

export default PatientChart;
