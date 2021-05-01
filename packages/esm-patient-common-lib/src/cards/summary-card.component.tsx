import React from "react";
import styles from "./summary-card.css";
import { Link } from "react-router-dom";
import { Trans } from "react-i18next";

export interface SummaryCardProps {
  name: string;
  styles?: React.CSSProperties;
  link?: string;
  addComponent?: boolean;
  editComponent?: boolean;
  editBtnUrl?: string;
  showComponent?(): void;
  className?: string;
}

function contents(name: string) {
  return (
    <div className={styles.title}>
      <h2 className={`omrs-margin-0`}>{name}</h2>
      <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
        <use xlinkHref="#omrs-icon-chevron-right" />
      </svg>
    </div>
  );
}

export const SummaryCard: React.FC<SummaryCardProps> = (props) => (
  <div
    style={props.styles}
    className={`omrs-card ${styles.card} ${props.className || ""}`}
  >
    <div className={styles.header}>
      <div className={styles.headerTitle}>
        {props.link ? (
          <Link to={props.link} className={`omrs-unstyled`}>
            {contents(props.name)}
          </Link>
        ) : (
          <>{contents(props.name)}</>
        )}
      </div>
      {props.addComponent && (
        <div className={styles.headerAdd}>
          <button
            className={`omrs-unstyled ${styles.addBtn}`}
            onClick={props.showComponent}
          >
            <Trans i18nKey="add">Add</Trans>
          </button>
        </div>
      )}
      {props.editComponent && (
        <div className={styles.headerEdit}>
          <button
            className={`omrs-unstyled ${styles.editBtn}`}
            onClick={props.showComponent}
          >
            <Trans i18nKey="edit">Edit</Trans>
          </button>
        </div>
      )}
      {props.editBtnUrl && (
        <div className={styles.headerEdit}>
          <button className={`omrs-unstyled ${styles.editBtn}`}>
            <Link className="omrs-unstyled" to={props.editBtnUrl}>
              <Trans i18nKey="edit">Edit</Trans>
            </Link>
          </button>
        </div>
      )}
    </div>
    {props.children}
  </div>
);
