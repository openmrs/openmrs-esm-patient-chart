import React from "react";
import { match, Link } from "react-router-dom";
import styles from "./summary-card-row.css";

export default function SummaryCardFooter(props: SummaryCardFooterProps) {
  if (!props.linkTo) {
    return <div className={styles.row}>{props.children}</div>;
  }
  return (
    <Link to={props.linkTo} className={`omrs-unstyled ${styles.row}`}>
      {props.children}
      <svg className="omrs-icon" fill="var(--omrs-color-ink-low-contrast)">
        <use xlinkHref="#omrs-icon-chevron-right" />
      </svg>
    </Link>
  );
}

type SummaryCardFooterProps = {
  linkTo?: string;
  children: React.ReactNode;
};
