import React from "react";
import { RouteComponentProps } from "react-router";
import { getCurrentPatient } from "@openmrs/esm-api";
import styles from "./patient-chart-summary.css";
import HistorySection from "./history/history-section.component";
import PatientBanner from "./banner/patient-banner.component";
import { createErrorHandler } from "@openmrs/esm-error-handling";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);
  const [showPatientSummary, setShowPatientSummary] = React.useState(true);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
      createErrorHandler();
    });

    return () => subscription.unsubscribe();
  });

  return (
    <main className="omrs-main-content">
      {showPatientSummary && (
        <div className={styles.patientSummary}>
          <HistorySection match={props.match} />
        </div>
      )}
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
