import React from "react";
import { match } from "react-router";

import dayjs from "dayjs";
import { createErrorHandler } from "@openmrs/esm-error-handling";

import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import { encounterResource } from "./encounter.resource";
import NotesValues from "../cards/notes-values.component";
import style from "./notes-card-style.css";
import SummaryCardFooter from "../cards/summary-card-footer.component";

export default function NotesCard(props: NotesCardProps) {
  const [patientNotes, setPatientNotes] = React.useState(null);
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    const abortController = new AbortController();

    encounterResource(props.currentPatient.identifier[0].value, abortController)
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
      <SummaryCardRow>
        <SummaryCardRowContent justifyContent="space-between">
          <NotesValues
            date="Date"
            dateStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
            label="Encounter type,"
            labelStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
            location=" Location"
            locationStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
            author="Author"
            authorStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
      {patientNotes &&
        patientNotes.slice(0, showMore ? patientNotes.length : 5).map(note => {
          return (
            <SummaryCardRow key={note.id} linkTo="/notes">
              <NotesValues
                date={convertDate(note.location[0].period.end)}
                dateClassName="omrs-bold"
                dateStyles={{ alignContent: "left" }}
                label={note.type[0].coding[0].display}
                labelClassName="omrs-bold"
                location={note.location[0].location.display}
                locationStyles={{
                  color: "var(--omrs-color-ink-medium-contrast)"
                }}
                author={getAuthorName(note.extension)}
                authorClassName="omrs-bold"
              />
            </SummaryCardRow>
          );
        })}
      <SummaryCardFooter linkTo="/notes">
        <div className={style.moreNotes}>
          <svg className="omrs-icon">
            <use
              xlinkHref="#omrs-icon-chevron-right"
              fill="var(--omrs-color-ink-low-contrast)"
            ></use>
          </svg>
          <p>See all</p>
        </div>
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
