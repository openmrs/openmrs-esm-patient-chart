import React, { useState, useEffect, Fragment } from "react";
import { useRouteMatch } from "react-router-dom";
import SummaryCard from "../cards/summary-card.component";
import styles from "./notes-summary.css";
import { useCurrentPatient } from "@openmrs/esm-api";
import { getEncounterObservableRESTAPI } from "./encounter.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { formatDate } from "../heightandweight/heightandweight-helper";

function NotesSummary(props: NotesSummaryProps) {
  const resultsPerPage = 10;
  const [patientNotes, setPatientNotes] = useState<PatientNotes[]>();
  const [totalPages, setTotalPages] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showNextButton, setShowNextButton] = React.useState(false);
  const [showPreviousButton, setShowPreviousButton] = React.useState(false);
  const [currentPageResults, setCurrentPageResults] = React.useState([]);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  useEffect(() => {
    if (!isLoadingPatient && patient) {
      const subscription = getEncounterObservableRESTAPI(patientUuid).subscribe(
        (notes: any) => {
          setPatientNotes(notes.results);
          setTotalPages(Math.ceil(notes.results.length / resultsPerPage));
          setCurrentPageResults(notes.results.slice(0, resultsPerPage));
        },
        createErrorHandler()
      );

      return () => subscription.unsubscribe();
    }
  }, [patientUuid, isLoadingPatient, patient]);

  useEffect(() => {
    {
      patientNotes && currentPage * resultsPerPage > patientNotes.length
        ? setShowNextButton(false)
        : setShowNextButton(true);
      currentPage !== 1
        ? setShowPreviousButton(true)
        : setShowPreviousButton(false);
    }
  }, [currentPageResults, currentPage, patientNotes]);

  function toTitleCase(string: string) {
    let results = string.split(" ").map(word => {
      return word[0].toUpperCase() + word.slice(1);
    });
    return results.join(" ");
  }

  const nextPage = () => {
    let upperBound = currentPage * resultsPerPage + resultsPerPage;
    const lowerBound = currentPage * resultsPerPage;
    if (upperBound > patientNotes.length) {
      upperBound = patientNotes.length;
    }
    const pageResults = patientNotes.slice(lowerBound, upperBound);
    setCurrentPageResults(pageResults);
    setCurrentPage(currentPage + 1);
  };

  const previousPage = () => {
    const lowerBound = resultsPerPage * (currentPage - 2);
    const upperBound = resultsPerPage * (currentPage - 1);
    const pageResults = patientNotes.slice(lowerBound, upperBound);
    setCurrentPageResults(pageResults);
    setCurrentPage(currentPage - 1);
  };

  return (
    <SummaryCard name="Notes">
      <table className={styles.detailedNotesTable}>
        <thead>
          <tr>
            <td>DATE</td>
            <td>
              NOTE
              <svg className="omrs-icon">
                <use xlinkHref="#omrs-icon-arrow-downward"></use>
              </svg>
              <span style={{ marginLeft: "1.25rem" }}>LOCATION</span>
            </td>
            <td colSpan={2}>AUTHOR</td>
          </tr>
        </thead>
        <tbody>
          {currentPageResults &&
            currentPageResults.map(note => {
              return (
                <Fragment key={note.uuid}>
                  <tr>
                    <td className="omrs-bold">
                      {formatDate(note.encounterDatetime)}
                    </td>
                    <td>
                      <span
                        className="omrs-bold"
                        style={{ paddingBottom: "0.625rem" }}
                      >
                        {note.encounterType.name.toUpperCase()}
                      </span>
                      <span
                        style={{
                          color: "var(--omrs-color-ink-medium-contrast)",
                          margin: "0rem"
                        }}
                      >
                        {toTitleCase(note.location.name)}
                      </span>
                    </td>
                    <td>
                      {note.auditInfo.creator
                        ? String(note.auditInfo.creator.display).toUpperCase()
                        : String(
                            note.auditInfo.changedBy.display
                          ).toUpperCase()}
                    </td>
                    <td style={{ textAlign: "end", paddingRight: "0.625rem" }}>
                      <svg className="omrs-icon">
                        <use
                          fill={"var(--omrs-color-ink-low-contrast)"}
                          xlinkHref="#omrs-icon-chevron-right"
                        ></use>
                      </svg>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <div>
          {showPreviousButton && (
            <button
              onClick={previousPage}
              className={`${styles.navButton} omrs-bold omrs-btn omrs-text-neutral omrs-rounded`}
            >
              <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                <use xlinkHref="#omrs-icon-chevron-left" />
              </svg>
              Previous
            </button>
          )}
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div>
          {showNextButton && (
            <button
              onClick={nextPage}
              className={`${styles.navButton} omrs-bold omrs-btn omrs-text-neutral omrs-rounded`}
            >
              Next
              <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                <use xlinkHref="#omrs-icon-chevron-right" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </SummaryCard>
  );
}

type NotesSummaryProps = {};

type PatientNotes = {
  uuid: string;
  display: string;
  encounterDatetime: string;
  location: { uuid: string; display: string; name: string };
  encounterType: { name: string; uuid: string };
  auditInfo: {
    creator: any;
    uuid: string;
    display: string;
    links: any;
    dateCreated: Date;
    changedBy?: any;
    dateChanged?: Date;
  };
};

export default NotesSummary;
