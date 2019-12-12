import React from "react";
import styles from "./conditions-detailedSummary.css";
import dayjs from "dayjs";
import SummaryCard from "../../cards/summary-card.component";
import { match } from "react-router";
import { performPatientConditionSearch } from "../conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import { useTranslation } from "react-i18next";

export default function ConditionsDetailedSummary(
  props: ConditionsDetailedSummaryProps
) {
  const [patientConditions, setPatientConditions] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (patient) {
      const abortController = new AbortController();
      performPatientConditionSearch(
        patient.identifier[0].value,
        abortController
      )
        .then(data => {
          if (data["entry"]) {
            let a = data.entry;
            sort(a);
            setPatientConditions(a);
          }
        })
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [patient]);

  return (
    <div className={styles.conditionsPrimary}>
      <SummaryCard
        name={t("conditions", "Conditions")}
        match={props.match}
        styles={{ width: "100%" }}
      >
        <table className={styles.conditionsTable}>
          <thead>
            <tr>
              <td>CONDITION</td>
              <td>
                <div className={styles.centerItems}>ONSET DATE</div>
              </td>
              <td>STATUS</td>
            </tr>
          </thead>
          <tbody>
            {patientConditions &&
              patientConditions.map(condition => {
                return (
                  <tr
                    key={condition.resource.id}
                    className={
                      condition.resource.clinicalStatus === "active"
                        ? styles.active
                        : styles.resolved
                    }
                  >
                    <td className="omrs-bold">
                      {condition.resource.code.text}
                    </td>
                    <td>
                      {dayjs(condition.resource.onsetDateTime).format(
                        "MMM-YYYY"
                      )}
                    </td>
                    <td>{condition.resource.clinicalStatus}</td>
                    <td>
                      <svg className="omrs-icon" fill="rgba(60, 60, 67, 0.3)">
                        <use xlinkHref="#omrs-icon-chevron-right" />
                      </svg>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </SummaryCard>
    </div>
  );

  function sort(conditions) {
    conditions.sort((a, b) => {
      if (
        a.resource.clinicalStatus === "active" &&
        b.resource.clinicalStatus === "active"
      ) {
        return a.resource.onsetDateTime > b.resource.onsetDateTime ? -1 : 1;
      } else if (
        a.resource.clinicalStatus === "active" &&
        b.resource.clinicalStatus === "resolved"
      ) {
        return -1;
      } else if (
        a.resource.clinicalStatus === "resolved" &&
        b.resource.clinicalStatus === "resolved"
      ) {
        return a.resource.onsetDateTime > b.resource.onsetDateTime ? -1 : 1;
      } else {
        return 1;
      }
    });
  }
}

type ConditionsDetailedSummaryProps = {
  match: match;
};
