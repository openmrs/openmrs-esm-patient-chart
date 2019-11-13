import React from "react";
import styles from "./dimensions-card-level-two.css";
import SummaryCard from "../cards/summary-card.component";
import { getDimensions } from "./dimensions-card.resource";
import { match } from "react-router";

function DimensionsCardLevelTwo(props: DimensionsCardLevelTwoProps) {
  const [dimensions, setDimensions] = React.useState([]);

  React.useEffect(() => {
    const sub = getDimensions(props.currentPatient.id).subscribe(dimensions =>
      setDimensions(dimensions)
    );
    return () => sub.unsubscribe();
  }, []);

  return (
    <div style={{ display: "flex" }}>
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

type DimensionsCardLevelTwoProps = {
  currentPatient: fhir.Patient;
  match: match;
};

export default DimensionsCardLevelTwo;
