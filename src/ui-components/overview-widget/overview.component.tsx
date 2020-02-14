import React from "react";
import styles from "./overview.css";

export default function Overview(props: OverviewProps) {
  return (
    <div className={styles.patientChartCardsContainer}>
      <div className={styles.patientChartCards}>
        {props.config.map((Component, index) => {
          return <Component key={index} />;
        })}
      </div>
    </div>
  );
}

type OverviewProps = {
  config: any[];
};
