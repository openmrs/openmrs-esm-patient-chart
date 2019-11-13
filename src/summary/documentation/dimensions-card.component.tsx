import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import { getHeight, getWeight } from "./dimension.resource";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import HorizontalSectionCard from "../cards/horizontal-section-card.component";
import DimensionsSectionCard from "./dimensions-card-row.component";
import * as timeago from "timeago.js";
import ShowMoreCard from "./show-more-card.component";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import styles from "./dimensions-card-level-one.css";
export default function DimensionsCard(props: DimensionsCardProps) {
  const [dimensions, setDimensions] = React.useState([]);
  const [showMore, setShowMore] = React.useState(false);
  const [heights, setHeights] = React.useState([]);
  const [weights, setWeights] = React.useState([]);
  const [bmis, setBmis] = React.useState([]);

  React.useEffect(() => {
    const abortController = new AbortController();
    getHeight(props.currentPatient.id)
      .then(({ data }) => {
        getWeight(props.currentPatient.id)
          .then(({ data }) => {})
          .catch(createErrorHandler());
      })
      .catch(createErrorHandler());

    return () => abortController.abort();
  }, [props.currentPatient.id]);
  return (
    <SummaryCard
      name="Height & Weight"
      match={props.match}
      styles={{ flex: 1, margin: ".5rem", maxWidth: "46rem" }}
    >
      <SummaryCardRow>
        <SummaryCardRowContent>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableRow}>
                <th
                  className={`${styles.tableHeader} ${styles.tableDates}`}
                  style={{ textAlign: "start" }}
                ></th>
                <th className={styles.tableHeader}>Weight</th>
                <th className={styles.tableHeader}>Height</th>
                <th className={styles.tableHeader}>BMI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dimension, index) => (
                <tr key={dimension.id} className={styles.tableRow}>
                  <td
                    className={styles.tableData}
                    style={{ textAlign: "start" }}
                  >
                    {dimension.date}
                  </td>
                  <td className={styles.tableData}>
                    {dimension.weight || "\u2014"}
                  </td>
                  <td className={styles.tableData}>
                    {dimension.height || "\u2014"}
                  </td>
                  <td className={styles.tableData}>
                    {dimension.bmi || "\u2014"}
                  </td>
                  <td style={{ textAlign: "end" }}>
                    <svg
                      className="omrs-icon"
                      fill="var(--omrs-color-ink-low-contrast)"
                    >
                      <use xlinkHref="#omrs-icon-chevron-right" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent>
          <ShowMoreCard
            func={() => {
              setShowMore(!showMore);
            }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
    </SummaryCard>
  );
}

type DimensionsCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
