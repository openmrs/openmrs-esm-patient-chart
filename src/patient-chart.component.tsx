import React from "react";
import { RouteComponentProps } from "react-router";
import PatientChartWorkspace from "./workspace/patient-chart-workspace.component";
import PatientChartSummary from "./summary/patient-chart-summary.component";
export default function PatientChart(props: PatientChartProps) {
  return (
    <main className="omrs-main-content">
      <div>hello world</div>
      <PatientChartWorkspace></PatientChartWorkspace>
    </main>
  );
}

type PatientChartProps = {};
