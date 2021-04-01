import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import capitalize from "lodash-es/capitalize";
import SummaryCard from "../cards/summary-card.component";
import EmptyState from "./empty-state/empty-state.component";
import styles from "./conditions-detailed-summary.css";
import { useRouteMatch, Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useCurrentPatient, createErrorHandler } from "@openmrs/esm-framework";
import {
  Condition,
  performPatientConditionsSearch
} from "./conditions.resource";
import { ConditionsForm } from "./conditions-form.component";

function openWorkspaceTab(_1: any, _2: any) {
  //TODO
}

export default function ConditionsDetailedSummary(
  props: ConditionsDetailedSummaryProps
) {
  const [patientConditions, setPatientConditions] = useState<Array<Condition>>(
    null
  );
  const [isLoadingPatient, patient] = useCurrentPatient();
  const { t } = useTranslation();
  const match = useRouteMatch();
  const path = `${match.url.replace(":subView", "details")}/details`;

  useEffect(() => {
    if (!isLoadingPatient && patient) {
      const sub = performPatientConditionsSearch(
        patient.identifier[0].value
      ).subscribe(conditions => {
        setPatientConditions(conditions);
      }, createErrorHandler());

      return () => sub.unsubscribe();
    }
  }, [isLoadingPatient, patient]);

  return (
    <div className="styles.conditionSummary">
      {patientConditions?.length ? (
        <SummaryCard
          name={t("conditions", "Conditions")}
          styles={{ width: "100%" }}
          addComponent={ConditionsForm}
          showComponent={() =>
            openWorkspaceTab(
              ConditionsForm,
              `${t("conditionsForm", "Conditions Form")}`
            )
          }
        >
          <table className={`omrs-type-body-regular ${styles.conditionTable}`}>
            <thead>
              <tr>
                <td>
                  <Trans i18nKey="condition">Condition</Trans>
                </td>
                <td>
                  <Trans i18nKey="onsetDate">Onset date</Trans>
                </td>
                <td>
                  <Trans i18nKey="status">Status</Trans>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {patientConditions.map(condition => {
                return (
                  <React.Fragment key={condition.id}>
                    <tr
                      className={`${
                        condition.clinicalStatus === "active"
                          ? `${styles.active}`
                          : `${styles.inactive}`
                      }`}
                    >
                      <td className="omrs-medium">{condition.display}</td>
                      <td>
                        <div className={`${styles.alignRight}`}>
                          {condition.onsetDateTime
                            ? dayjs(condition.onsetDateTime).format("MMM-YYYY")
                            : "-"}
                        </div>
                      </td>
                      <td>
                        <div
                          className={`${styles.centerItems} ${styles.alignLeft}`}
                        >
                          <span>{capitalize(condition.clinicalStatus)}</span>
                        </div>
                      </td>
                      <td>
                        {
                          <Link to={`${path}/${condition.id}`}>
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
        </SummaryCard>
      ) : (
        <EmptyState
          displayText={t("conditions", "conditions")}
          headerTitle={t("conditions", "Conditions")}
          launchForm={() =>
            openWorkspaceTab(
              ConditionsForm,
              `${t("conditionsForm", "Conditions Form")}`
            )
          }
        />
      )}
    </div>
  );
}

type ConditionsDetailedSummaryProps = {};
