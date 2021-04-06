import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import capitalize from "lodash-es/capitalize";
import SummaryCard from "../cards/summary-card.component";
import RecordDetails from "../cards/record-details-card.component";
import ConditionsForm from "./conditions-form.component";
import styles from "./condition-record.css";
import { RouteComponentProps } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import { getConditionByUuid } from "./conditions.resource";
import { useConditionsContext } from "./conditions.context";
import { openWorkspaceTab } from "./openWorkspaceTab";

interface ConditionRecordProps
  extends RouteComponentProps<{ conditionUuid: string }> {}

export default function ConditionRecord(props: ConditionRecordProps) {
  const [patientCondition, setPatientCondition] = useState(null);
  const { patient } = useConditionsContext();
  const { t } = useTranslation();
  const { conditionUuid } = props.match.params;

  useEffect(() => {
    if (patient) {
      const sub = getConditionByUuid(conditionUuid).subscribe(
        condition => setPatientCondition(condition),
        createErrorHandler()
      );
      return () => sub.unsubscribe();
    }
  }, [patient, conditionUuid]);

  return (
    <>
      {!!(patientCondition && Object.entries(patientCondition).length) && (
        <div className={styles.conditionContainer}>
          <SummaryCard
            name={t("condition", "Condition")}
            styles={{ width: "100%" }}
            editComponent={ConditionsForm}
            showComponent={() => {
              openWorkspaceTab(
                ConditionsForm,
                `${t("editCondition", "Edit Condition")}`,
                {
                  conditionUuid: patientCondition?.id,
                  conditionName: patientCondition?.display,
                  clinicalStatus: patientCondition?.clinicalStatus,
                  onsetDateTime: patientCondition?.onsetDateTime
                }
              );
            }}
            link="/"
          >
            <div className={`omrs-type-body-regular ${styles.conditionCard}`}>
              <div>
                <p className="omrs-type-title-3">{patientCondition.display}</p>
              </div>
              <table className={styles.conditionTable}>
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="onsetDate">Onset date</Trans>
                    </th>
                    <th>
                      <Trans i18nKey="status">Status</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {dayjs(patientCondition.onsetDateTime).format("MMM-YYYY")}
                    </td>
                    <td>{capitalize(patientCondition.clinicalStatus)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SummaryCard>
          <RecordDetails>
            <table className={styles.conditionTable}>
              <thead>
                <tr>
                  <th>
                    <Trans i18nKey="lastUpdated">Last updated</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="lastUpdatedBy">Last updated by</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="lastUpdatedLocation">
                      Last updated location
                    </Trans>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {patientCondition?.lastUpdated
                      ? dayjs(patientCondition?.lastUpdated).format(
                          "DD-MMM-YYYY"
                        )
                      : "-"}
                  </td>
                  <td>{patientCondition?.lastUpdatedBy ?? "-"}</td>
                  <td>{patientCondition?.lastUpdatedLocation ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </RecordDetails>
        </div>
      )}
    </>
  );
}
