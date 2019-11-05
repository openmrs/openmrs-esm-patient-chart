import React, { ReactChildren } from "react";
import styles from "./summary-card.css";
import { match } from "react-router";

export default function SummaryCard(props: SummaryCardProps) {
  const stylesCard: Styles = {
    width: props.cardSize,
    margin: "1rem 1rem 0 0"
  };
  return (
    <div style={stylesCard} className={`omrs-card`}>
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
SummaryCard.defaultProps = { cardSize: "21.75rem" };

type SummaryCardProps = {
  name: string;
  match: match;
  children: React.ReactNode;
  cardSize: String;
  styles?: React.CSSProperties;
};

type Styles = {};
