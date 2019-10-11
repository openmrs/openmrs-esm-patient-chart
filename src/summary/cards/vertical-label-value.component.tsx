import React from "react";
import styles from "./vertical-label-value.css";

export default function VerticalLabelValue(props: VerticalLabelValueProps) {
  return (
    <div className={styles.root}>
      <label className={`omrs-type-body-small ${styles.label}`}>
        {props.label}
      </label>
      <div style={props.valueStyles}>
        {/* em-dash is shown if no value is passed in */}
        {props.value || "\u2014"}
      </div>
    </div>
  );
}

VerticalLabelValue.defaultProps = {
  valueStyles: {}
};

type VerticalLabelValueProps = {
  label: string;
  value: React.ReactNode;
  valueStyles?: React.CSSProperties;
};
