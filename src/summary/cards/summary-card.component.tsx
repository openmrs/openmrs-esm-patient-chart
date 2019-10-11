import React, { ReactChildren } from "react";
import styles from "./summary-card.css";
import { match } from "react-router";

export default function SummaryCard(props: SummaryCardProps) {
  return (
    <div className={`omrs-card ${styles.card}`}>
      <div className={styles.header}>
        <h2 className={`omrs-margin-0`}>{props.name}</h2>
        <svg className="omrs-icon" fill="var(--omrs-color-inactive-grey)">
          <use xlinkHref="#omrs-icon-chevron-right" />
        </svg>
      </div>
      {props.children}
    </div>
  );
}

type SummaryCardProps = {
  name: string;
  match: match;
  children: React.ReactNode;
};
