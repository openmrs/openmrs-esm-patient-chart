import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import ProgramsForm from "./programs-form.component";
import EmptyState from "./empty-state/empty-state.component";
import SummaryCard from "../cards/summary-card.component";
import styles from "./programs-detailed-summary.css";
import { useTranslation, Trans } from "react-i18next";
import { RouteComponentProps, Link } from "react-router-dom";
import { createErrorHandler, useCurrentPatient } from "@openmrs/esm-framework";
import { fetchEnrolledPrograms } from "./programs.resource";
import { PatientProgram } from "../types";

function openWorkspaceTab(_1: any, _2: any, _3?: any) {
  //TODO
}

interface ProgramsDetailedSummaryProps extends RouteComponentProps<{}> {}

export default function ProgramsDetailedSummary(
  props: ProgramsDetailedSummaryProps
) {
  const [enrolledPrograms, setEnrolledPrograms] = useState<
    Array<PatientProgram>
  >([]);
  const [isLoadingPatient, , patientUuid] = useCurrentPatient();
  const { t } = useTranslation();

  useEffect(() => {
    if (patientUuid && !isLoadingPatient) {
      const subscription = fetchEnrolledPrograms(patientUuid).subscribe(
        (enrolledPrograms) => setEnrolledPrograms(enrolledPrograms),
        createErrorHandler()
      );
      return () => subscription.unsubscribe();
    }
  }, [patientUuid, isLoadingPatient]);

  return (
    <>
      {enrolledPrograms?.length ? (
        <div className={styles.programsSummary}>
          <SummaryCard
            name={t("carePrograms", "Care Programs")}
            styles={{
              width: "100%",
            }}
            addComponent={ProgramsForm}
            showComponent={() =>
              openWorkspaceTab(
                ProgramsForm,
                `${t("programsForm", "Programs Form")}`,
                {
                  setEnrolledPrograms: setEnrolledPrograms,
                  enrolledPrograms: enrolledPrograms,
                }
              )
            }
          >
            <table className={`omrs-type-body-regular ${styles.programTable}`}>
              <thead>
                <tr>
                  <th>
                    <Trans i18nKey="activePrograms">Active Programs</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="since">Since</Trans>
                  </th>
                  <th>
                    <Trans i18nKey="status">Status</Trans>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enrolledPrograms?.map((program) => {
                  return (
                    <React.Fragment key={program.uuid}>
                      <tr
                        className={`${
                          program.dateCompleted
                            ? `${styles.inactive}`
                            : `${styles.active}`
                        }`}
                      >
                        <td className="omrs-medium">{program.display}</td>
                        <td>
                          {dayjs(program.dateEnrolled).format("MMM-YYYY")}
                        </td>
                        <td>
                          {program.dateCompleted ? (
                            <span className={styles.completionDate}>
                              <Trans i18nKey="Completed on">Completed on</Trans>{" "}
                              {dayjs(program.dateCompleted).format(
                                "DD-MMM-YYYY"
                              )}
                            </span>
                          ) : (
                            <Trans i18nKey="active">Active</Trans>
                          )}
                        </td>
                        <td>
                          {
                            <Link to={`/${program.uuid}`}>
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
        </div>
      ) : (
        <EmptyState
          displayText={t("programEnrollments", "program enrollments")}
          headerTitle={t("carePrograms", "Care Programs")}
          launchForm={() =>
            openWorkspaceTab(
              ProgramsForm,
              `${t("programsForm", "Programs Form")}`,
              {
                setEnrolledPrograms: setEnrolledPrograms,
                enrolledPrograms: enrolledPrograms,
              }
            )
          }
        />
      )}
    </>
  );
}
