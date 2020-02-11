import React from "react";
import styles from "../summaries/overview/patient-chart-overview.css";
import ConditionsOverview from "../../widgets/conditions/conditions-overview.component";
import AllergyOverview from "../../widgets/allergies/allergy-overview.component";
import ProgramsOverview from "../../widgets/programs/programs-overview.component";

export default function HistoryChartOverview(props: HistoryChartOverviewProps) {
  const config = ["conditions", "programs", "allergies"];

  const coreComponents = {
    conditions: ConditionsOverview,
    programs: ProgramsOverview,
    allergies: AllergyOverview
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

type HistoryChartOverviewProps = {};
