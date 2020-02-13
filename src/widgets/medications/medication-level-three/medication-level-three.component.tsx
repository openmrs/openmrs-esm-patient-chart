import React from "react";
import { match } from "react-router";
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

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();
      getMedicationByUuid(
        abortController,
        props.match.params["medicationUuid"]
      ).then(response => {
        setMedication(response.data);
      });
      return () => abortController.abort();
    }
  }, [isLoadingPatient, patient, props.match.params]);

  function displayMedication() {
    return (
      <>
        <SummaryCard
          name="Medication"
          match={props.match}
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
          <SummaryCardRowContent justifyContent="space-between">
            <div
              style={{
                float: "left"
              }}
            >
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                {" "}
                Start date
              </span>
              <br />
              <span style={{ display: "block" }}>
                {" "}
                {dayjs(patientMedication.dateActivated).format("DD-MMM-YYYY")}
              </span>
            </div>
            <div
              style={{
                float: "right"
              }}
            >
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Substitutions permitted
              </span>
              <span style={{ display: "block" }}>NO </span>
            </div>
          </SummaryCardRowContent>
          <SummaryCardRowContent justifyContent="space-between">
            <div style={{ float: "left" }}>
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                {" "}
                End date
              </span>
              <span style={{ display: "block" }}>
                {" "}
                {dayjs(patientMedication.dateStopped).format(
                  "DD-MMM-YYYY"
                )}{" "}
              </span>
            </div>
            <div
              style={{
                float: "right"
              }}
            >
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                Dosing Instructions
              </span>
              <span style={{ display: "block" }}>
                {patientMedication.drug.strength}
                {" \u2014 "}
                {patientMedication.frequency.display}{" "}
              </span>
            </div>
          </SummaryCardRowContent>
          <SummaryCardRowContent justifyContent="space-between">
            <div style={{ float: "left" }}>
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                {" "}
                Duration
              </span>
              <span
                style={{
                  display: "block"
                }}
              >
                {" "}
                {patientMedication.duration}
                {patientMedication.durationUnits.display}{" "}
              </span>
            </div>
          </SummaryCardRowContent>
          <SummaryCardRowContent justifyContent="space-between">
            <div style={{ float: "left" }}>
              <span style={{ color: "var(--omrs-color-ink-low-contrast)" }}>
                {" "}
                Total number of refills
              </span>
              <span
                style={{
                  display: "block"
                }}
              >
                {" "}
                {patientMedication.numRefills}{" "}
              </span>
            </div>
          </SummaryCardRowContent>
        </SummaryCard>
      </>
    );
  }
  function details() {
    return (
      <SummaryCard
        name="Details"
        match={props.match}
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
                <td data-testid="last-updated">
                  {dayjs(patientMedication.dateActivated).format("DD-MMM-YYYY")}
                </td>
                <td data-testid="updated-by">
                  {patientMedication.orderer.person.display}
                </td>
                <td data-testid="update-location">{`Location Test`}</td>
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
type MedicationCardLevelThreeProps = {
  match: match;
};
