import React, { ReactChildren } from "react";
import styles from "./summary-card.css";
import { match } from "react-router";

export default function SummaryCard(props: SummaryCardProps) {
  return (
    <div className={`omrs-card ${styles.card}`} style={props.styles}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h2 className={`omrs-margin-0`}>{props.name}</h2>
          <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
            <use xlinkHref="#omrs-icon-chevron-right" />
          </svg>
        </div>
        <button className={`omrs-unstyled ${styles.addBtn}`}>Add</button>
      </div>
      {props.children}
    </div>
  );
}

SummaryCard.defaultProps = {
  styles: {}
};

type SummaryCardProps = {
  name: string;
  match: match;
  children: React.ReactNode;
  styles?: React.CSSProperties;
};
