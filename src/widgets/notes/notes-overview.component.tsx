import React from "react";
import { match } from "react-router";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import SummaryCard from "../cards/summary-card.component";
import { getEncounters } from "./encounter.resource";
import styles from "./notes-overview.css";
import { useCurrentPatient } from "@openmrs/esm-api";
import { Link } from "react-router-dom";
import { getNotes, formatNotesDate, getAuthorName } from "./notes-helper";
import SummaryCardFooter from "../cards/summary-card-footer.component";

export default function NotesOverview(props: NotesOverviewProps) {
  const [patientNotes, setPatientNotes] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    if (patient) {
      const abortController = new AbortController();

      getEncounters(patient.identifier[0].value, abortController)
        .then(({ data }) => {
          setPatientNotes(getNotes(data.entry));
        })
        .catch(createErrorHandler());
      return () => abortController.abort();
    }
  }, [patient]);

  return (
    <SummaryCard
      name="Notes"
      match={props.match}
      styles={{ margin: "1.25rem, 1.5rem", width: "100%", maxWidth: "45rem" }}
    >
      <table className={styles.tableNotes}>
        <thead>
          <tr className={styles.tableNotesRow}>
            <th className={`${styles.tableNotesHeader} ${styles.tableDates}`}>
              Date
            </th>
            <th className={styles.tableNotesHeader}>
              Encounter type, Location
            </th>
            <th className={styles.tableNotesHeader}>Author</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {patientNotes &&
            patientNotes.slice(0, 5).map(note => (
              <tr key={note.id} className={styles.tableNotesRow}>
                <td className={styles.tableNotesDate}>
                  {formatNotesDate(note.location[0].period.end)}
                </td>
                <td className={styles.tableNotesData}>
                  {note.type[0].coding[0].display || "\u2014"}
                  <div className={styles.location}>
                    {note.location[0].location.display || "\u2014"}
                  </div>
                </td>
                <td className={styles.tableNotesAuthor}>
                  {getAuthorName(note) || "\u2014"}
                </td>
                <td className={styles.tdLowerSvg} style={{ textAlign: "end" }}>
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

      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/notes`} />
    </SummaryCard>
  );
}

type NotesOverviewProps = {
  match: match;
};
