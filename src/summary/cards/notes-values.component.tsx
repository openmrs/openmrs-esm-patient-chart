import React from "react";
import styles from "./notes-values.css";

export default function NotesValues(props: NotesValuesProps) {
  return (
    <div className={styles.root}>
      {props.date && (
        <label
          className={props.dateClassName || "omrs-type-body-regular"}
          style={props.dateStyles}
        >
          {props.date}
          {props.specialKey && <sup>{"\u002A"}</sup>}
        </label>
      )}
      {props.location && (
        <div className={styles.verticalLabelValue}>
          <label
            className={
              props.labelClassName || `omrs-type-body-small ${styles.label}`
            }
          >
            {props.label}
          </label>
          <div
            className={props.locationClassName}
            style={props.locationStyles}
            title={props.label}
          >
            {props.location || "\u2014"}
          </div>
        </div>
      )}

      {props.author && (
        <div
          className={props.authorClassName || "omrs-type-body-regular"}
          style={props.authorStyles}
        >
          {props.author || "\u2014"}
        </div>
      )}
    </div>
  );
}

NotesValues.defaultProps = {
  dateStyles: {},
  authorStyles: {},
  labelStyles: {},
  className: "",
  specialKey: false
};

type NotesValuesProps = {
  date?: string;
  label: string;
  location: React.ReactNode;
  author?: any;
  authorStyles?: React.CSSProperties;
  locationStyles?: React.CSSProperties;
  dateStyles?: React.CSSProperties;
  specialKey: boolean;
  labelClassName?: string;
  locationClassName?: string;
  dateClassName?: string;
  authorClassName?: string;
  detailsClassName?: string;
};
