import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import HistorySection from "./history/history-section.component";
import DocumentationSection from "./documentation/documentation-section.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  return (
    <main className="omrs-main-content">
      <div className={styles.patientSummary}>
        <HistorySection match={props.match} />
      </div>
      <div className={styles.patientSummary}>
        <DocumentationSection match={props.match} />
      </div>
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
