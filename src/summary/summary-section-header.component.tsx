import React from "react";
import { Link, match } from "react-router-dom";
import styles from "./summary-section-header.css";

export default function SummarySectionHeader(props: SummarySectionHeaderProps) {
  return (
    <Link to={props.match.url} className={`omrs-unstyled ${styles.headerLink}`}>
      <h1 className={`omrs-type-title-1 ${styles.header}`}>{props.name}</h1>
      <svg className="omrs-icon" fill="var(--omrs-color-ink-medium-contrast)">
        <use xlinkHref="#omrs-icon-chevron-right"></use>
      </svg>
    </Link>
  );
}

type SummarySectionHeaderProps = {
  match: match;
  name: string;
};
