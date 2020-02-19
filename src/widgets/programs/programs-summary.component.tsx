import React from "react";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import { fetchPatientPrograms } from "./programs.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./programs-summary.css";

export default function ProgramsSummary(props: ProgramsSummaryProps) {
  const [patientPrograms, setPatientPrograms] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const { t } = useTranslation();

  React.useEffect(() => {
    const subscription = fetchPatientPrograms(patientUuid).subscribe(
      programs => setPatientPrograms(programs),
      createErrorHandler()
    );

    return () => subscription.unsubscribe();
  }, [patientUuid]);

  function displayPrograms() {
    return (
      <SummaryCard
        name="Care Programs"
        styles={{
          width: "100%"
        }}
      >
        <table className={`omrs-type-body-regular ${styles.programTable}`}>
          <thead>
            <tr>
              <td>ACTIVE PROGRAMS</td>
              <td>SINCE</td>
              <td>STATUS</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {patientPrograms &&
              patientPrograms.map(program => {
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
                      <td>{dayjs(program.dateEnrolled).format("MMM-YYYY")}</td>
                      <td>
                        {program.dateCompleted
                          ? `Completed on ${dayjs(program.dateCompleted).format(
                              "DD-MMM-YYYY"
                            )}`
                          : "Active"}
                      </td>
                      <td>
                        {
                          <Link
                            to={`/patient/${patientUuid}/chart/programs/${program.uuid}`}
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
      </SummaryCard>
    );
  }

  function displayNoPrograms() {
    return (
      <SummaryCard
        name="Care Programs"
        styles={{
          width: "100%",
          background: "var(--omrs-color-bg-low-contrast)",
          border: "none",
          boxShadow: "none"
        }}
      >
        <div className={styles.programMargin}>
          <p className="omrs-medium" data-testid="no-programs">
            Program data will appear here once the patient enrolls into a
            program.
          </p>
          <p className="omrs-medium">
            Please <a href="/">enroll the patient into a program</a>.
          </p>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientPrograms && (
        <div className={styles.programsSummary}>
          {patientPrograms.length > 0 ? displayPrograms() : displayNoPrograms()}
        </div>
      )}
    </>
  );
}

type ProgramsSummaryProps = {};
