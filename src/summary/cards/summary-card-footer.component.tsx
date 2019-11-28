import React from "react";
import { match, Link } from "react-router-dom";
import styles from "./summary-card-footer.css";

export default function SummaryCardFooter(props: SummaryCardFooterProps) {
  if (!props.linkTo) {
    return (
      <div className={styles.footer}>
        <p className="omrs-bold">See all</p>
      </div>
    );
  }
  return (
    <div className={`${styles.footer}`}>
      <svg className="omrs-icon" fill="var(--omrs-color-ink-medium-contrast)">
        <use xlinkHref="#omrs-icon-chevron-right" />
      </svg>
      <Link
        to={props.linkTo}
        className={`omrs-unstyled`}
        style={{ border: "none" }}
      >
        <p className="omrs-bold">See all</p>
      </Link>
    </div>
  );
}

type SummaryCardFooterProps = {
  linkTo?: string;
};
