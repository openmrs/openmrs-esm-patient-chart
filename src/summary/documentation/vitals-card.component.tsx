import React from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import { performPatientsVitalsSearch } from "./vitals-card.resource";
import styles from "./vitals-card.css";
import { formatDate } from "./dimension-helpers";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function VitalsCard(props: VitalsCardProps) {
  const [patientVitals, setPatientVitals] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    const subscription = performPatientsVitalsSearch(patientUuid).subscribe(
      vitals => setPatientVitals(vitals),
      createErrorHandler()
    );

    return () => subscription.unsubscribe();
  }, [patientUuid]);

  return (
    <SummaryCard
      name="Vitals"
      match={props.match}
      styles={{ flex: 1, margin: ".5rem", maxWidth: "46rem" }}
    >
      <table className={styles.vitalsTable}>
        <thead>
          <tr className="omrs-bold">
            <td></td>
            <td>BP</td>
            <td>Rate</td>
            <td>Oxygen</td>
            <td colSpan={2}>Temp</td>
          </tr>
        </thead>
        <tbody>
          {patientVitals &&
            patientVitals.map((vitals, index) => {
              return (
                <React.Fragment key={vitals.id}>
                  <tr>
                    <td>{formatDate(vitals.date)}</td>
                    <td>
                      {`${vitals.systolic} / ${vitals.diastolic}`}
                      {index === 0 && <span> mmHg</span>}
                    </td>
                    <td>
                      {vitals.pulse} {index === 0 && <span>bpm</span>}
                    </td>
                    <td>
                      {vitals.oxygenation} {index === 0 && <span>%</span>}
                    </td>
                    <td>
                      {vitals.temperature}
                      {index === 0 && <span> &#8451;</span>}
                    </td>
                    <td>
                      <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                        <use xlinkHref="#omrs-icon-chevron-right" />
                      </svg>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
      <a className={`${styles.vitalsFooter} omrs-bold`} href="/">
        <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
          <use xlinkHref="#omrs-icon-chevron-right" />
        </svg>
        See all
      </a>
    </SummaryCard>
  );
}

type VitalsCardProps = {
  match: match;
};
