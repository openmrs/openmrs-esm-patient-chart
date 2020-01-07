import React, { ReactChildren } from "react";
import styles from "./summary-card.css";
import { match, Link } from "react-router-dom";

import { Trans, useTranslation } from "react-i18next";

export default function SummaryCard(props: SummaryCardProps) {
  const { t } = useTranslation();
  return (
    <div style={props.styles} className={`omrs-card ${styles.card}`}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          {props.link ? (
            <Link to={props.link} className={`omrs-unstyled`}>
              {contents()}
            </Link>
          ) : (
            <>{contents()}</>
          )}
        </div>
        {props.addBtnUrl && (
          <div className={styles.headerAdd}>
            <button className={`omrs-unstyled ${styles.addBtn}`}>
              <Link className="omrs-unstyled" to={props.addBtnUrl}>
                Add
              </Link>
            </button>
          </div>
        )}
      </div>
      {props.children}
    </div>
  );

  function contents() {
    return (
      <div className={styles.title}>
        <h2 className={`omrs-margin-0`}>{props.name}</h2>
        <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
          <use xlinkHref="#omrs-icon-chevron-right" />
        </svg>
      </div>
    );
  }
}

type SummaryCardProps = {
  name: string;
  match: match;
  children: React.ReactNode;
  styles?: React.CSSProperties;
  link?: string;
  addBtnUrl?: string;
};

type Styles = {};
