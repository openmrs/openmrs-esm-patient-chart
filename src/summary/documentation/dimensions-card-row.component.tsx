import React from "react";
import styles from "./dimensions-card-row.css";

export default function DimensionsSectionCard(
  props: DimensionsSectionCardProps
) {
  return (
    <div className={styles.gridContainer}>
      <div>{props.content.date}</div>
      <div className={styles.text}>
        {props.content.cm}
        {props.key === 0 && <p>cm</p>}
      </div>
      <div className={styles.text}>
        {props.content.kg}
        {props.key === 0 && <p>kg</p>}
      </div>
      <div className={styles.text}>
        {props.content.bmi}
        {props.key === 0 && <p>kg/m</p>}
      </div>
    </div>
  );
}

type DimensionsSectionCardProps = {
  key: number;
  content: {
    date: string;
    cm: string;
    kg: string;
    bmi: string;
  };
};
