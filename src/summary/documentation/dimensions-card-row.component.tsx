import React from "react";
import styles from "./dimensions-card-row.css";

export default function DimensionsSectionCard(
  props: DimensionsSectionCardProps
) {
  return (
    <div className={styles.gridContainer}>
      <div>{props.content.date}</div>
      <div className={styles.text}>
        <span>
          {props.content.kg + " "}
          <span className={styles.unit}>{props.index === 0 && "kg"}</span>
        </span>
      </div>
      <div className={styles.text}>
        <span>
          {props.content.cm + " "}
          <span className={styles.unit}>{props.index === 0 && "cm"}</span>
        </span>
      </div>
      <div className={styles.text}>
        <span>
          {props.content.bmi + " "}
          <span className={styles.unit}>{props.index === 0 && "kg/m"}</span>
        </span>
      </div>
    </div>
  );
}

type DimensionsSectionCardProps = {
  index: number;
  content: {
    date: string;
    cm: string;
    kg: string;
    bmi: string;
  };
};
