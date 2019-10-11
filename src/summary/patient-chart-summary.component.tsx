import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-summary.css";
import ProfileSection from "./profile/profile-section.component";

export default function PatientChartSummary(props: PatientChartSummaryProps) {
  return (
    <main className={`omrs-main-content ${styles.patientSummary}`}>
      <ProfileSection match={props.match} />
    </main>
  );
}

type PatientChartSummaryProps = RouteComponentProps & {};
