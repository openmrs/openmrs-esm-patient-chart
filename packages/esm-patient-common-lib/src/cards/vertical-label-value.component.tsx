import React from "react";
import styles from "./vertical-label-value.css";

export interface VerticalLabelValueProps {
  label: string;
  value?: React.ReactNode;
  valueStyles?: React.CSSProperties;
  className?: string;
}

export const VerticalLabelValue: React.FC<VerticalLabelValueProps> = ({
  value = "\u2014",
  label,
  className = "",
  valueStyles = {},
}) => (
  <div className={styles.root}>
    <label className={`omrs-type-body-small ${styles.label}`}>{label}</label>
    <div className={className} style={valueStyles} title={label}>
      {value}
    </div>
  </div>
);
