import React, { useEffect, useState, Fragment } from "react";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import RecordDetails from "../cards/record-details-card.component";
import styles from "./note-record.css";
import { RouteComponentProps } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import { fetchEncounterByUuid } from "./encounter.resource";
import { useProgramsContext } from "./notes.context";

interface NoteRecordProps
  extends RouteComponentProps<{
    encounterUuid: string;
  }> {}

export default function NoteRecord({ match }: NoteRecordProps) {
  const [note, setNote] = useState(null);
  const { patient } = useProgramsContext();
  const { encounterUuid } = match.params;
  const { t } = useTranslation();

  useEffect(() => {
    if (patient && encounterUuid) {
      const sub = fetchEncounterByUuid(encounterUuid).subscribe(
        (note) => setNote(note),
        createErrorHandler()
      );
      return () => sub.unsubscribe();
    }
  }, [patient, encounterUuid]);

  return (
    <>
      {!!(note && Object.entries(note).length) && (
        <div className={styles.noteContainer}>
          <SummaryCard name={t("note", "Note")} styles={{ width: "100%" }}>
            <div className={`omrs-type-body-regular ${styles.noteCard}`}>
              <div>
                <p className="omrs-type-title-3">{note?.display}</p>
              </div>
              <table className={styles.noteTable}>
                <thead>
                  <tr>
                    <td>{t("encounterType", "Encounter type")}</td>
                    <td>{t("location", "Location")}</td>
                    <td>{t("encounterDate", "Encounter date")}</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{note?.encounterType?.display}</td>
                    <td>{note?.location?.display}</td>
                    <td>
                      {dayjs(note?.encounterDatetime).format("DD-MM-YYYY")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SummaryCard>
          {note.obs && note.obs.length && (
            <RecordDetails>
              {note.obs.map((ob) => {
                return (
                  <Fragment key={ob.uuid}>
                    <p>{ob.display}</p>
                  </Fragment>
                );
              })}
            </RecordDetails>
          )}
        </div>
      )}
    </>
  );
}
