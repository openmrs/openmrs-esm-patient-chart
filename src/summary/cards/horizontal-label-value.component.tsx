import React from "react";
import styles from "./horizontal-label-value.css";

export default function HorizontalLabelValue(props) {
  return (
    <div className={styles.root}>
      <label className="omrs-type-body-regular" style={props.labelStyles}>
        {props.label}
        {props.specialKey && <sup>{"\u002A"}</sup>}
      </label>
      <div
        title={props.label}
        className="omrs-type-body-regular"
        style={props.valueStyles}
      >
        {props.value || "\u2014"}
      </div>
    </div>
  );
}

HorizontalLabelValue.defaultProps = {
  labelStyles: {},
  valueStyles: {}
};

type HorizontalLabelValueProps = {
  label: string;
  value: React.ReactNode;
  valueStyles?: React.CSSProperties;
  labelStyles?: React.CSSProperties;
  specialKey: boolean;
};
