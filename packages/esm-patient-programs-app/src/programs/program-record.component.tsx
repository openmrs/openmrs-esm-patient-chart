import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import SummaryCard from "../../ui-components/cards/summary-card.component";
import ProgramsForm from "./programs-form.component";
import styles from "./program-record.css";
import { RouteComponentProps } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { createErrorHandler, useCurrentPatient } from "@openmrs/esm-framework";
import { getPatientProgramByUuid } from "./programs.resource";
import { openWorkspaceTab } from "../shared-utils";

interface ProgramRecordProps
  extends RouteComponentProps<{ programUuid: string }> {}

export default function ProgramRecord(props: ProgramRecordProps) {
  const [patientProgram, setPatientProgram] = useState(null);
  const [isLoadingPatient, patient, patientUuid] = useCurrentPatient();
  const { t } = useTranslation();
  const { programUuid } = props.match.params;

  useEffect(() => {
    if (!isLoadingPatient && patient && patientUuid) {
      const subscription = getPatientProgramByUuid(programUuid).subscribe(
        program => {
          setPatientProgram(program), createErrorHandler();
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [isLoadingPatient, patient, patientUuid, programUuid]);

  return (
    <>
      {!!(patientProgram && Object.entries(patientProgram).length) && (
        <div className={styles.programSummary}>
          <SummaryCard
            name={t("program", "Program")}
            styles={{ width: "100%" }}
            editComponent={ProgramsForm}
            showComponent={() =>
              openWorkspaceTab(
                ProgramsForm,
                `${t("editProgram", "Edit Program")}`,
                {
                  program: patientProgram?.program?.name,
                  programUuid: patientProgram?.uuid,
                  enrollmentDate: patientProgram?.dateEnrolled,
                  completionDate: patientProgram?.dateCompleted,
                  locationUuid: patientProgram?.location?.uuid
                }
              )
            }
          >
            <div className={`omrs-type-body-regular ${styles.programCard}`}>
              <div>
                <p className="omrs-type-title-3" data-testid="program-name">
                  {patientProgram.program.name}
                </p>
              </div>
              <table className={styles.programTable}>
                <thead>
                  <tr>
                    <td>
                      <Trans i18nKey="enrolledOn">Enrolled on</Trans>
                    </td>
                    <td>
                      <Trans i18nKey="status">Status</Trans>
                    </td>
                    <td>
                      <Trans i18nKey="enrolledAt">Enrolled at</Trans>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {dayjs(patientProgram?.dateEnrolled).format(
                        "DD-MMM-YYYY"
                      )}
                    </td>
                    <td className={styles.completedProgram}>
                      {patientProgram?.dateCompleted ? (
                        <span className={styles.completionDate}>
                          <Trans i18nKey="completedOn">Completed on</Trans>{" "}
                          {dayjs(patientProgram?.dateCompleted).format(
                            "DD-MMM-YYYY"
                          )}
                        </span>
                      ) : (
                        <Trans i18nKey="active">Active</Trans>
                      )}
                    </td>
                    <td>
                      {patientProgram?.location
                        ? patientProgram?.location?.display
                        : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SummaryCard>
        </div>
      )}
    </>
  );
}
