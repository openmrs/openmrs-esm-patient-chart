import React from "react";
import { RouteComponentProps } from "react-router";
import styles from "./patient-chart-workspace.css";

export default function PatientChartWorkspace(
  props: PatientChartWorkspaceProps
) {
  return <div className={styles.workspace}>hello world</div>;
}

type PatientChartWorkspaceProps = RouteComponentProps & {};
