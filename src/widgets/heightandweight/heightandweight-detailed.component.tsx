import React from "react";
import styles from "./heightandweight-detailed.css";
import SummaryCard from "../cards/summary-card.component";
import { getDimenionsObservationsRestAPI } from "./heightandweight.resource";
import { match } from "react-router";
import { useCurrentPatient } from "@openmrs/esm-api";

function HeightAndWeightDetailed(props: HeightAndWeightDetailedProps) {
  const [dimensions, setDimensions] = React.useState([]);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    if (patientUuid) {
      const sub = getDimenionsObservationsRestAPI(
        patientUuid
      ).subscribe(dimensions => setDimensions(dimensions));
      return () => sub.unsubscribe();
    }
  }, [patientUuid]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "3.25rem"
      }}
    >
      <SummaryCard
        name="Height & Weight"
        match={props.match}
        styles={{ flex: 1, margin: ".5rem" }}
      >
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableRow}>
              <th className={`${styles.tableHeader} ${styles.tableDates}`}></th>
              <th className={styles.tableHeader}>Weight (kg)</th>
              <th className={styles.tableHeader}>Height (cm)</th>
              <th className={styles.tableHeader}>
                BMI (kg/m<sup>2</sup>)
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dimensions.map(dimension => (
              <tr key={dimension.id} className={styles.tableRow}>
                <td className={styles.tableData} style={{ textAlign: "start" }}>
                  <span style={{ fontWeight: 500 }}>
                    {dimension.date.split(" ")[0]}
                  </span>{" "}
                  {dimension.date.slice(
                    dimension.date.indexOf(" ") + 1,
                    dimension.date.length
                  )}
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
      </SummaryCard>
    </div>
  );
}

type HeightAndWeightDetailedProps = {
  match: match;
};

export default HeightAndWeightDetailed;
