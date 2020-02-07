import React from "react";
import styles from "../../summaries/overview/patient-chart-overview.css";
import AllergyOverview from "../allergies/allergy-overview.component";
import MedicationsOverview from "./medications-overview.component";

export default function MedicationsChartOverview(
  props: MedicationsChartOverviewProps
) {
  const config = ["medications", "allergies"];

  const coreComponents = {
    allergies: AllergyOverview,
    medications: MedicationsOverview
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

type MedicationsChartOverviewProps = {};
