import React from "react";
import { match } from "react-router";
import { getConditionByUuid } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import dayjs from "dayjs";
import styles from "./conditions-detailed-summary.css";
import SummaryCard from "../cards/summary-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function ConditionsDetailedSummary(
  props: ConditionsDetailedSummaryProps
) {
  const [patientCondition, setPatientCondition] = React.useState(null);
  const [isLoadingPatient, patient, patientUuid] = useCurrentPatient();

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();

      getConditionByUuid(props.match.params["conditionUuid"], abortController)
        .then(condition => setPatientCondition(condition))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [isLoadingPatient, patient]);

  function displayCondition() {
    return (
      <>
        <SummaryCard
          name="Condition"
          match={props.match}
          styles={{ width: "100%" }}
          editBtnUrl={`/patient/${patientUuid}/chart/conditions/edit`}
        >
          <div className={styles.conditionCard}>
            <div>
              <p className={styles.conditionName} data-testid="condition-name">
                {patientCondition.resource.code.text}
              </p>
            </div>
            <table className={styles.conditionTable}>
              <thead>
                <tr>
                  <td>Onset date</td>
                  <td>Status</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-testid="onset-date">
                    {dayjs(patientCondition.resource.onsetDateTime).format(
                      "MMM-YYYY"
                    )}
                  </td>
                  <td data-testid="clinical-status">
                    {capitalize(patientCondition.resource.clinicalStatus)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SummaryCard>
      </>
    );
  }

  function displayDetails() {
    return (
      <SummaryCard
        name="Details"
        match={props.match}
        styles={{
          width: "100%",
          backgroundColor: "var(--omrs-color-bg-medium-contrast)"
        }}
      >
        <div className={styles.conditionCard}>
          <table className={styles.conditionTable}>
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
                  {dayjs(patientCondition.resource.lastUpdated).format(
                    "DD-MMM-YYYY"
                  )}
                </td>
                <td data-testid="updated-by">
                  {patientCondition.resource.lastUpdatedBy}
                </td>
                <td data-testid="update-location">
                  {patientCondition.resource.lastUpdatedLocation}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientCondition && (
        <div className={styles.conditionSummary}>{displayCondition()}</div>
      )}
      {patientCondition && (
        <div className={styles.conditionSummary}>{displayDetails()}</div>
      )}
    </>
  );
}

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

type ConditionsDetailedSummaryProps = {
  match: match;
};
