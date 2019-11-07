import React, { ReactChildren } from "react";
import styles from "./summary-card.css";
import { match } from "react-router";

export default function SummaryCard(props: SummaryCardProps) {
  return (
    <div style={props.styles} className={`omrs-card ${styles.card}`}>
      <div className={styles.header}>
        <h2 className={`omrs-margin-0`}>{props.name}</h2>
        <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
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
  styles?: React.CSSProperties;
};

type Styles = {};
