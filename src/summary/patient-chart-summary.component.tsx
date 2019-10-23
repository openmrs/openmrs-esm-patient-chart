import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import ProfileSection from "./profile/profile-section.component";
import HistorySection from "./history/history-section.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  return (
    <main className={`omrs-main-content ${styles.patientSummary}`}>
      <ProfileSection match={props.match} />
      <HistorySection match={props.match} />
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
