import React from "react";
import styles from "../summaries/overview/patient-chart-overview.css";
import VitalsOverview from "../../widgets/vitals/vitals-overview.component";
import HeightAndWeightOverview from "../../widgets/heightandweight/heightandweight-overview.component";
export default function ResultsChartOverview(props: ResultsChartOverviewProps) {
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

type ResultsChartOverviewProps = {};
