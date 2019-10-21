import React from "react";
import { match, Link } from "react-router-dom";
import styles from "./summary-card-row.css";

export default function SummaryCardRow(props: SummaryCardRowProps) {
  return (
    <Link to={props.linkTo} className={`omrs-unstyled ${styles.row}`}>
      {props.children}
      {props.linkTo && (
        <svg className="omrs-icon" fill="var(--omrs-color-ink-low-contrast)">
          <use xlinkHref="#omrs-icon-chevron-right" />
        </svg>
      )}
    </Link>
  );
}

type SummaryCardRowProps = {
  linkTo: string;
  children: React.ReactNode;
};
