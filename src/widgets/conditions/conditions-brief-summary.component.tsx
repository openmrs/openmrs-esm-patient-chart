import React from "react";
import { match } from "react-router";
import { performPatientConditionSearch } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import dayjs from "dayjs";
import styles from "./conditions-brief-summary.css";
import SummaryCard from "../cards/summary-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function ConditionsBriefSummary(
  props: ConditionsBriefSummaryProps
) {
  const [patientCondition, setPatientCondition] = React.useState(null);
  const [isLoadingPatient, patient, patientUuid] = useCurrentPatient();

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();

      performPatientConditionSearch(
        patient.identifier[0].value,
        abortController
      )
        .then(condition => setPatientCondition(condition))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [isLoadingPatient, patient]);

  function displayConditions() {
    return (
      <SummaryCard
        name="Conditions"
        match={props.match}
        styles={{ width: "100%" }}
        addBtnUrl={`/patient/${patientUuid}/chart/conditions/add`}
      >
        <table className={styles.conditionTable}>
          <thead>
            <tr>
              <td>CONDITION</td>
              <td>ONSET DATE</td>
              <td>STATUS</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {patientCondition &&
              patientCondition.entry
                .sort((a, b) =>
                  a.resource.clinicalStatus > b.resource.clinicalStatus ? 1 : -1
                )
                .map(condition => {
                  return (
                    <React.Fragment key={condition.resource.id}>
                      <tr
                        className={`${
                          condition.resource.clinicalStatus === "active"
                            ? `${styles.active}`
                            : `${styles.inactive}`
                        }`}
                      >
                        <td className={"omrs-bold"}>
                          {condition.resource.code.text}
                        </td>
                        <td>
                          <div className={`${styles.alignRight}`}>
                            {dayjs(condition.resource.onsetDateTime).format(
                              "MMM-YYYY"
                            )}
                          </div>
                        </td>
                        <td>
                          <div
                            className={`${styles.centerItems} ${styles.alignLeft}`}
                          >
                            <span>
                              {capitalize(condition.resource.clinicalStatus)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <svg
                            className="omrs-icon"
                            fill="var(--omrs-color-ink-low-contrast)"
                          >
                            <use xlinkHref="#omrs-icon-chevron-right" />
                          </svg>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
          </tbody>
        </table>
        <div className={styles.conditionFooter}>
          <p
            style={{ color: "var(--omrs-color-ink-lowest-contrast)" }}
            className={"omrs-type-body-large"}
          >
            No more conditions available
          </p>
        </div>
      </SummaryCard>
    );
  }

  function displayNoConditions() {
    return (
      <SummaryCard
        name="Conditions"
        match={props.match}
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-low-contrast)",
          border: "none",
          boxShadow: "none"
        }}
        addBtnUrl={`/patient/${patientUuid}/chart/conditions/add`}
      >
        <div className={styles.conditionMargin}>
          <p className="omrs-bold">No Conditions are documented.</p>
          <p className="omrs-bold">
            Please <a href="/">add patient condition.</a>
          </p>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientCondition && (
        <div className={styles.conditionSummary}>
          {patientCondition.total > 0
            ? displayConditions()
            : displayNoConditions()}
        </div>
      )}
    </>
  );
}

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

type ConditionsBriefSummaryProps = {
  match: match;
};
