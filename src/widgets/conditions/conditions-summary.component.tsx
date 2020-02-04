import React from "react";
import { match } from "react-router";
import { Link } from "react-router-dom";
import { performPatientConditionsSearch } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import dayjs from "dayjs";
import styles from "./conditions-summary.css";
import SummaryCard from "../cards/summary-card.component";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function ConditionsSummary(props: ConditionsSummaryProps) {
  const [patientConditions, setPatientConditions] = React.useState(null);
  const [isLoadingPatient, patient, patientUuid] = useCurrentPatient();

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();

      performPatientConditionsSearch(
        patient.identifier[0].value,
        abortController
      )
        .then(conditions => setPatientConditions(conditions))
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
        addBtnUrl={`/patient/${patientUuid}/chart/conditions/form/`}
      >
        <table className={`omrs-type-body-regular ${styles.conditionTable}`}>
          <thead>
            <tr>
              <td>CONDITION</td>
              <td>ONSET DATE</td>
              <td>STATUS</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {patientConditions &&
              patientConditions.entry
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
                        <td className="omrs-medium">
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
                          {
                            <Link
                              to={`/patient/${patientUuid}/chart/conditions/${condition.resource.id}`}
                            >
                              <svg
                                className="omrs-icon"
                                fill="var(--omrs-color-ink-low-contrast)"
                              >
                                <use xlinkHref="#omrs-icon-chevron-right" />
                              </svg>
                            </Link>
                          }
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
          </tbody>
        </table>
        <div className={`omrs-type-body-regular ${styles.conditionFooter}`}>
          <p>No more conditions available</p>
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
        addBtnUrl={`/patient/${patientUuid}/chart/conditions/form/`}
      >
        <div className={styles.conditionMargin}>
          <p className="omrs-medium">No Conditions are documented.</p>
          <p className="omrs-medium">
            Please <a href="/">add patient condition.</a>
          </p>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientConditions && (
        <div className={styles.conditionSummary}>
          {patientConditions.total > 0
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

type ConditionsSummaryProps = {
  match: match;
};
