import React from "react";
import styles from "./dimensions-card-row.css";
export default function DimensionsSectionCard(
  props: DimensionsSectionCardProps
) {
  console.log(props);
  return (
    <div className={styles.gridContainer}>
      <div>{props.content.date}</div>
      <div className={styles.text}>
        {props.content.cm}
        {props.index === 0 && <p>cm</p>}
      </div>
      <div className={styles.text}>
        {props.content.kg}
        {props.index === 0 && <p>kg</p>}
      </div>
      <div className={styles.text}>
        {props.content.bmi}
        {props.index === 0 && <p>m/m</p>}
      </div>
    </div>
  );
}

DimensionsSectionCard.defaultProps = {};

type DimensionsSectionCardProps = {
  index: number;
  content: {
    date: string;
    cm: string;
    kg: string;
    bmi: string;
  };
};
