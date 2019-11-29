import React, { useState, useEffect } from "react";
import { match } from "react-router";
import styles from "./patient-notes-level-2-style.css";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCard from "../cards/summary-card.component";
import { getEncounters } from "./encounter.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { getNotes, getAuthorName, formatNotesDate } from "./notes-helper";
import Pagination from "./pagination";

export default function PatientNotesCardLevel2(props: PatientNotesCardProps) {
  const [patientNotes, setPatientNotes] = useState([]);
  const [displayedNotes, setDisplayedNotes] = useState([]);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const paginate = (indexOfFirstResult: number, indexOfLastResult: number) => {
    setDisplayedNotes(
      patientNotes.slice(indexOfFirstResult, indexOfLastResult)
    );
  };
  useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();
      getEncounters(patient.identifier[0].value, abortController)
        .then(({ data }) => {
          setPatientNotes(getNotes(data.entry));
        })
        .catch(createErrorHandler());
      return () => abortController.abort();
    }
  }, [patient, isLoadingPatient]);

  return (
    <div className={styles.notesSummary}>
      {displayNotes(props, patientNotes)}
    </div>
  );
  function displayNotes(props, patientNotes) {
    return (
      <SummaryCard
        name="Notes"
        match={props.match}
        styles={{ width: "100rem" }}
      >
        <table className={styles.tableNotesLevel2}>
          <thead>
            <tr className={styles.tableNotesLevel2Row}>
              <th
                className={`${styles.tableNotesLevel2Header} ${styles.tableNotesLevel2Dates}`}
              >
                DATE
              </th>
              <th className={styles.tableNotesLevel2Header}>
                <div className={styles.centerItems}>
                  NOTE
                  <svg
                    className="omrs-icon"
                    fill="var(--omrs-color-ink-low-contrast)"
                  >
                    <use xlinkHref="#omrs-icon-arrow-downward" />
                  </svg>
                  <p style={{ marginLeft: "2rem" }}>LOCATION</p>
                </div>
              </th>
              <th className={styles.tableNotesLevel2Header}>AUTHOR</th>
              <th></th>
            </tr>
          </thead>
          <tbody className={styles.tableNotesLevel2Body}>
            {patientNotes &&
              displayedNotes.map(note => (
                <tr key={note.id} className={styles.tableNotesLevel2Row}>
                  <td className={styles.tableNotesLevel2Date}>
                    {formatNotesDate(note.location[0].period.end)}
                  </td>
                  <td className={styles.tableNotesLevel2Data}>
                    {note.type[0].coding[0].display || "\u2014"}
                    <div className={styles.location}>
                      {note.location[0].location.display || "\u2014"}
                    </div>
                  </td>
                  <td className={styles.tableNotesLevel2Author}>
                    {getAuthorName(note)}
                  </td>
                  <td
                    className={styles.tdLowerSvg}
                    style={{ textAlign: "end" }}
                  >
                    <svg
                      className="omrs-icon"
                      fill="var(--omrs-color-ink-low-contrast)"
                    >
                      <use xlinkHref="#omrs-icon-chevron-right" />
                    </svg>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination
          resultsPerPage={10}
          totalData={patientNotes.length}
          paginate={paginate}
        />
      </SummaryCard>
    );
  }
}

type PatientNotesCardProps = {
  match: match;
};
