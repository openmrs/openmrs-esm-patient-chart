import React from "react";
import { RouteComponentProps } from "react-router";
import { getCurrentPatient } from "@openmrs/esm-api";
import styles from "./patient-chart-summary.css";
import HistorySection from "./history/history-section.component";
import PatientBanner from "./banner/patient-banner.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
    });

    return () => subscription.unsubscribe();
  });

  return (
    <main className="omrs-main-content">
      <PatientBanner
        match={props.match}
        patient={currentPatient}
      ></PatientBanner>
      <div className={styles.patientSummary}>
        <HistorySection match={props.match} />
      </div>
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
