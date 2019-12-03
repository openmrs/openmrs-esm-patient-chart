import React, { ReactChildren } from "react";
import styles from "./summary-card.css";
import { match } from "react-router";
import { Trans, useTranslation } from "react-i18next";

export default function SummaryCard(props: SummaryCardProps) {
  const { t } = useTranslation();
  return (
    <div style={props.styles} className={`omrs-card ${styles.card}`}>
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

type SummaryCardProps = {
  name: string;
  match: match;
  children: React.ReactNode;
  styles?: React.CSSProperties;
};

type Styles = {};
