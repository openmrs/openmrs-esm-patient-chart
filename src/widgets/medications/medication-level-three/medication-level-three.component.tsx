import React from "react";
import { useRouteMatch } from "react-router";
import dayjs from "dayjs";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import { getMedicationByUuid } from "../medications.resource";
import SummaryCard from "../../cards/summary-card.component";
import { getDosage } from "../medication-orders-utils";
import SummaryCardRowContent from "../../cards/summary-card-row-content.component";
import VerticalLabelValue from "../../cards/vertical-label-value.component";

import styles from "./medication-level-three.css";

export default function MedicationCardLevelThree(
  props: MedicationCardLevelThreeProps
) {
  const [patientMedication, setMedication] = React.useState(null);
  const [isLoadingPatient, patient, patientUuid] = useCurrentPatient();

  const match = useRouteMatch();

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();
      getMedicationByUuid(abortController, match.params["medicationUuid"]).then(
        response => {
          setMedication(response.data);
        }
      );
      return () => abortController.abort();
    }
  }, [isLoadingPatient, patient, match.params]);

  function displayMedication() {
    return (
      <>
        <SummaryCard
          name="Medication"
          styles={{ width: "90%" }}
          editBtnUrl={`/patient/${patientUuid}/chart/medication/edit`}
        >
          <SummaryCardRowContent>
            <span
              style={{
                fontWeight: 500,
                fontSize: "130%",
                color: "var(--omrs-color-ink-low-contrast)"
              }}
            >
              {" "}
              <b>{patientMedication.drug.display}</b>
            </span>
          </SummaryCardRowContent>
          <SummaryCardRowContent justifyContent="space-between">
            <span>
              <b>{patientMedication.drug.display}</b>
              {" \u2014 "}{" "}
              {String(patientMedication.doseUnits.display).toLocaleLowerCase()}
              {" \u2014 "}{" "}
              {String(patientMedication.route.display).toLocaleLowerCase()}
              {" \u2014 "}{" "}
              {`DOSE ${getDosage(
                patientMedication.drug.strength,
                patientMedication.dose
              )}`}{" "}
              {" \u2014 "}
              <b>
                {String(
                  patientMedication.frequency.display
                ).toLocaleLowerCase()}
              </b>
            </span>
          </SummaryCardRowContent>
          <br />
          <div className={styles.gridContainer}>
            <div className="item1">
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Start date
              </span>
              <br />
              <span className={styles.medicationDisplay}>
                {dayjs(patientMedication.dateActivated).format("DD-MMM-YYYY")}
              </span>
            </div>
            <div className="item2">
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Substitutions permitted
              </span>
              <span className={styles.medicationDisplay}>NO </span>
            </div>
            <div className="item3"></div>
            <div className="item4">
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                End date
              </span>
              <span className={styles.medicationDisplay}>
                {dayjs(patientMedication.dateStopped).format("DD-MMM-YYYY")}
              </span>
            </div>
            <div className="item5">
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Dosing Instructions
              </span>
              <span className={styles.medicationDisplay}>
                {patientMedication.drug.strength}
                {" \u2014 "}
                {patientMedication.frequency.display}
              </span>
            </div>
            <div className="item6"></div>
            <div className="item7">
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Duration
              </span>
              <span className={styles.medicationDisplay}>
                {patientMedication.duration}
                {patientMedication.durationUnits.display}
              </span>
            </div>
            <div className="item8"></div>
            <div className="item10"></div>
            <div className="item11">
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Total number of refills
              </span>
              <span className={styles.medicationDisplay}>
                {patientMedication.numRefills}
              </span>
            </div>
          </div>
        </SummaryCard>
      </>
    );
  }
  function details() {
    return (
      <SummaryCard
        name="Details"
        styles={{
          width: "90%",
          backgroundColor: "var(--omrs-color-bg-medium-contrast)"
        }}
      >
        <div className={`omrs-type-body-regular ${styles.medicationCard}`}>
          <table className={styles.medicationTable}>
            <thead>
              <tr>
                <td>Last updated</td>
                <td>Last updated by</td>
                <td>Last updated location</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {dayjs(patientMedication.dateActivated).format("DD-MMM-YYYY")}
                </td>
                <td>{patientMedication.orderer.person.display}</td>
                <td>{`Location Test`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientMedication && (
        <div className={styles.conditionSummary}>{displayMedication()}</div>
      )}
      {patientMedication && (
        <div className={styles.conditionSummary}>{details()}</div>
      )}
    </>
  );
}
type MedicationCardLevelThreeProps = {};
