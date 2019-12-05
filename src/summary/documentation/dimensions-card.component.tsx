import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import { getDimensions } from "./dimensions-card.resource";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import ShowMoreCard from "./show-more-card.component";
import styles from "./dimensions-card-level-one.css";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../cards/summary-card-footer.component";

export default function DimensionsCard(props: DimensionsCardProps) {
  const [dimensions, setDimensions] = React.useState([]);
  const [showMore, setShowMore] = React.useState(false);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    const sub = getDimensions(patientUuid).subscribe(dimensions => {
      setDimensions(dimensions);
    });

    return () => sub.unsubscribe();
  }, [patientUuid]);

  return (
    <SummaryCard
      name="Height & Weight"
      match={props.match}
      styles={{ width: "100%", maxWidth: "45rem" }}
      link={`/patient/${patientUuid}/chart/dimensions`}
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
              {dimensions.slice(0, showMore ? 6 : 3).map((dimension, index) => (
                <tr key={dimension.id} className={styles.tableRow}>
                  <td
                    className={styles.tableData}
                    style={{ textAlign: "start" }}
                  >
                    {dimension.date}
                  </td>
                  <td className={styles.tableData}>
                    {dimension.weight || "\u2014"}
                    <span className={styles.unit}>{index === 0 && " kg"}</span>
                  </td>
                  <td className={styles.tableData}>
                    {dimension.height || "\u2014"}
                    <span className={styles.unit}>{index === 0 && " cm"}</span>
                  </td>
                  <td className={styles.tableData}>
                    {dimension.bmi || "\u2014"}
                    {}
                    <span className={styles.unit}>
                      {index === 0 && " kg/m"}
                      {index === 0 && <sup>2</sup>}
                    </span>
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
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/dimensions`} />
    </SummaryCard>
  );
}

type DimensionsCardProps = {
  match: match;
};
