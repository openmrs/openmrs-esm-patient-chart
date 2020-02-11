import React from "react";
import styles from "../../summaries/overview/patient-chart-overview.css";
import MedicationsOverview from "../../widgets/medications/medications-overview.component";

export default function OrdersChartOverview(props: OrdersChartOverviewProps) {
  const config = ["medications"];

  const coreComponents = {
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

type OrdersChartOverviewProps = {};
