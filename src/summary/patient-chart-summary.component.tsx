import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import HistorySection from "./history/history-section.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  return (
    <div className={styles.patientSummary}>
      <HistorySection match={props.match} />
    </div>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
