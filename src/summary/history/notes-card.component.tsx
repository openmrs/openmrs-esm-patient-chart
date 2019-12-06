import React from "react";
import { match } from "react-router";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import SummaryCard from "../cards/summary-card.component";
import { getEncounters } from "./encounter.resource";
import styles from "./notes-card-style.css";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import { formatDate } from "../documentation/dimension-helpers";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function NotesCard(props: NotesCardProps) {
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
          if (data.total > 0) {
            setPatientNotes(getNotes(data.entry));
          }
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
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableRow}>
            <th className={`${styles.tableHeader} ${styles.tableDates}`}>
              Date
            </th>
            <th className={styles.tableHeader}>Encounter type, Location</th>
            <th className={styles.tableHeader}>Author</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {patientNotes &&
            patientNotes.slice(0, 5).map(note => (
              <tr key={note.id} className={styles.tableRow}>
                <td className={styles.tableDate}>
                  {formatDate(note.location[0].period.end)}
                </td>
                <td className={styles.tableData}>
                  {note.type[0].coding[0].display || "\u2014"}
                  <div className={styles.location}>
                    {note.location[0].location.display || "\u2014"}
                  </div>
                </td>
                <td className={styles.tableData}>
                  {getAuthorName(note.extension) || "\u2014"}
                </td>
                <td style={{ textAlign: "end" }}>
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
function getNotes(notes) {
  return notes.map(note => note.resource);
}
function getAuthorName(extension: any): string {
  const author = extension.find(ext => ext.url === "changedBy");
  return author ? author.valueString.toUpperCase() : "";
}

type NotesCardProps = {
  match: match;
};
