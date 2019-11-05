import React from "react";
import styles from "./dimensions-card-row.css";
export default function DimensionsSectionCard(
  props: DimensionsSectionCardProps
) {
  return (
    <div className={styles.gridContainer}>
      <div>{props.content.date}</div>
      <div>{props.content.cm}</div>
      <div>{props.content.kg}</div>
      <div>{props.content.bmi}</div>
    </div>
  );
}

DimensionsSectionCard.defaultProps = {};

type DimensionsSectionCardProps = {
  content: {
    date: string;
    cm: string;
    kg: string;
    bmi: string;
  };
};
