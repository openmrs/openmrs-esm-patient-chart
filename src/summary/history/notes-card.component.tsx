import React from "react";
import { match } from "react-router";
import dayjs from "dayjs";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import SummaryCard from "../cards/summary-card.component";
import { getEncounters } from "./encounter.resource";
import styles from "./notes-card-style.css";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import { formatDate } from "../documentation/dimension-helpers";

export default function NotesCard(props: NotesCardProps) {
  const [patientNotes, setPatientNotes] = React.useState(null);

  React.useEffect(() => {
    const abortController = new AbortController();

    getEncounters(props.currentPatient.identifier[0].value, abortController)
      .then(({ data }) => {
        if (data.total > 0) {
          setPatientNotes(getNotes(data.entry));
        }
      })
      .catch(createErrorHandler());
    return () => abortController.abort();
  }, [props.currentPatient.identifier[0].value]);

  return (
    <SummaryCard name="Notes" match={props.match} styles={{ width: "45.5rem" }}>
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
                <td className={styles.tableDate} style={{ textAlign: "start" }}>
                  {formatDate(note.location[0].period.end)}
                </td>
                <td className={styles.tableData}>
                  {note.type[0].coding[0].display || "\u2014"}
                  <div
                    style={{ color: "var(--omrs-color-ink-medium-contrast)" }}
                  >
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

      <SummaryCardFooter linkTo="/notes">
        <p>See all</p>
      </SummaryCardFooter>
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
function convertDate(date: string): string {
  const unprocessedDate = dayjs(date);
  if (unprocessedDate.format("DD-MMM-YYYY") === dayjs().format("DD-MMM-YYYY")) {
    return "Today   ".concat(unprocessedDate.format("h:mm a"));
  } else if (unprocessedDate.format("YYYY") === dayjs().format("YYYY")) {
    return unprocessedDate.format("DD-MMM h:mm a");
  }
  return unprocessedDate.format("DD-MMM-YYYY h:mm a");
}

type NotesCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
