import React from "react";
import { match } from "react-router";
import { useCurrentPatient } from "@openmrs/esm-api";
import { getPatientProgramByUuid } from "./programs.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import SummaryCard from "../cards/summary-card.component";
import styles from "./programs-detailed-summary.css";
import dayjs from "dayjs";

export default function ProgramsDetailedSummary(
  props: ProgramsDetailedSummaryProps
) {
  const [patientProgram, setPatientProgram] = React.useState(null);
  const [isLoadingPatient, patient, patientUuid] = useCurrentPatient();

  React.useEffect(() => {
    if (!isLoadingPatient && patient && patientUuid) {
      const subscription = getPatientProgramByUuid(
        props.match.params["programUuid"]
      ).subscribe(program => setPatientProgram(program), createErrorHandler());

      return () => subscription.unsubscribe();
    }
  }, [isLoadingPatient, patient, patientUuid, props.match.params]);

  return (
    <>
      {patientProgram && (
        <div className={styles.programSummary}>
          {
            <>
              <SummaryCard
                name="Program"
                match={props.match}
                styles={{ width: "100%" }}
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
                        <td>Enrolled on</td>
                        <td>Status</td>
                        <td>Enrolled at</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {dayjs(patientProgram.dateEnrolled).format(
                            "DD-MMM-YYYY"
                          )}
                        </td>
                        <td>
                          {patientProgram.dateCompleted
                            ? `Completed on ${dayjs(
                                patientProgram.dateCompleted
                              ).format("DD-MMM-YYYY")}`
                            : "Active"}
                        </td>
                        <td>
                          {patientProgram.location
                            ? patientProgram.location
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </SummaryCard>
            </>
          }
        </div>
      )}
    </>
  );
}

type ProgramsDetailedSummaryProps = {
  match: match;
};
