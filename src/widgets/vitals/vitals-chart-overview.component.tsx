import React from "react";
import styles from "../../summaries/overview/patient-chart-overview.css";
import VitalsOverview from "./vitals-overview.component";
import HeightAndWeightOverview from "../heightandweight/heightandweight-overview.component";

export default function VitalsChartOverview(props: VitalsChartOverviewProps) {
  const config = ["vitals", "heightAndWeight"];

  const coreComponents = {
    vitals: VitalsOverview,
    heightAndWeight: HeightAndWeightOverview
  };

  return (
    <div className={styles.patientChartCardsContainer}>
      <div className={styles.patientChartCards}>
        {config.map((widget, index) => {
          let Component;
          if (typeof widget === "string") {
            Component = coreComponents[widget];
          } else {
            Component = widget["module"];
          }

          return <Component key={index} />;
        })}
      </div>
    </div>
  );
}

type VitalsChartOverviewProps = {};
