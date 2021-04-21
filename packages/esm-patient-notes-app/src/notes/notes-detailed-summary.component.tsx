import React, { useState, useEffect, useCallback, Fragment } from "react";
import EmptyState from "./empty-state/empty-state.component";
import SummaryCard from "../cards/summary-card.component";
import VisitNotes from "./visit-notes-form.component";
import styles from "./notes-detailed-summary.css";
import capitalize from "lodash-es/capitalize";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import {
  getEncounterObservableRESTAPI,
  PatientNote,
} from "./encounter.resource";
import { formatDate } from "./biometric.helper";
import { useNotesContext } from "./notes.context";
import { openWorkspaceTab } from "./openWorkspaceTab";

const resultsPerPage = 10;

interface NotesDetailedSummaryProps {}

const NotesDetailedSummary: React.FC<NotesDetailedSummaryProps> = () => {
  const { t } = useTranslation();
  const { patient, patientUuid } = useNotesContext();
  const [patientNotes, setPatientNotes] = useState<Array<PatientNote>>();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  const [currentPageResults, setCurrentPageResults] = useState<
    Array<PatientNote>
  >();

  useEffect(() => {
    if (patient) {
      const subscription = getEncounterObservableRESTAPI(patientUuid).subscribe(
        (notes) => {
          setPatientNotes(notes);
          setTotalPages(Math.ceil(notes.length / resultsPerPage));
          setCurrentPageResults(notes.slice(0, resultsPerPage));
        },
        createErrorHandler()
      );

      return () => subscription.unsubscribe();
    }
  }, [patientUuid, patient]);

  useEffect(() => {
    {
      patientNotes && currentPage * resultsPerPage >= patientNotes.length
        ? setShowNextButton(false)
        : setShowNextButton(true);
      currentPage !== 1
        ? setShowPreviousButton(true)
        : setShowPreviousButton(false);
    }
  }, [patientNotes, currentPageResults, currentPage]);

  const nextPage = useCallback(() => {
    let upperBound = currentPage * resultsPerPage + resultsPerPage;
    const lowerBound = currentPage * resultsPerPage;

    if (upperBound > patientNotes.length) {
      upperBound = patientNotes.length;
    }

    const pageResults = patientNotes.slice(lowerBound, upperBound);
    setCurrentPageResults(pageResults);
    setCurrentPage(currentPage + 1);
  }, [currentPage, patientNotes]);

  const previousPage = useCallback(() => {
    const lowerBound = resultsPerPage * (currentPage - 2);
    const upperBound = resultsPerPage * (currentPage - 1);
    const pageResults = patientNotes.slice(lowerBound, upperBound);
    setCurrentPageResults(pageResults);
    setCurrentPage(currentPage - 1);
  }, [currentPage, patientNotes]);

  return (
    <>
      {patientNotes && (
        <div className={styles.notesSummary}>
          {patientNotes.length > 0 ? (
            <SummaryCard
              name={t("notes", "Notes")}
              addComponent={VisitNotes}
              showComponent={() =>
                openWorkspaceTab(VisitNotes, `${t("visitNote", "Visit Note")}`)
              }
            >
              <table className={`omrs-type-body-regular ${styles.notesTable}`}>
                <thead>
                  <tr
                    className={styles.notesTableRow}
                    style={{ textTransform: "uppercase" }}
                  >
                    <th>{t("date", "Date")}</th>
                    <th style={{ textAlign: "left" }}>
                      {t("note", "Note")}
                      <svg
                        className="omrs-icon"
                        style={{
                          height: "0.813rem",
                          fill: "var(--omrs-color-ink-medium-contrast)",
                        }}
                      >
                        <use xlinkHref="#omrs-icon-arrow-downward"></use>
                      </svg>
                      <span style={{ marginLeft: "1.25rem" }}>
                        {t("location", "Location")}
                      </span>
                    </th>
                    <th style={{ textAlign: "left" }}>
                      {t("author", "Author")}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPageResults &&
                    currentPageResults.map((note) => {
                      return (
                        <Fragment key={note.id}>
                          <tr className={styles.notesTableDataRow}>
                            <td className={styles.noteDate}>
                              {formatDate(note?.encounterDate)}
                            </td>
                            <td className={styles.noteInfo}>
                              <span className="omrs-medium">
                                {note.encounterType}
                              </span>
                              <div
                                style={{
                                  color:
                                    "var(--omrs-color-ink-medium-contrast)",
                                  margin: "0rem",
                                }}
                              >
                                {capitalize(note.encounterLocation)}
                              </div>
                            </td>
                            <td className={styles.noteAuthor}>
                              {note.encounterAuthor
                                ? note.encounterAuthor
                                : "\u2014"}
                            </td>
                            <td
                              style={{
                                textAlign: "end",
                                paddingRight: "0.625rem",
                              }}
                            >
                              <Link to={`/${note.id}`}>
                                <svg className="omrs-icon">
                                  <use
                                    fill="var(--omrs-color-ink-low-contrast)"
                                    xlinkHref="#omrs-icon-chevron-right"
                                  ></use>
                                </svg>
                              </Link>
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
                      <svg
                        className="omrs-icon"
                        fill="var(--omrs-color-ink-low-contrast)"
                      >
                        <use xlinkHref="#omrs-icon-chevron-left" />
                      </svg>
                      {t("previous", "Previous")}
                    </button>
                  )}
                </div>
                {patientNotes.length <= resultsPerPage ? (
                  <div
                    className="omrs-type-body-regular"
                    style={{ fontFamily: "Work Sans" }}
                  >
                    <p
                      style={{ color: "var(--omrs-color-ink-medium-contrast)" }}
                    >
                      {t("noMoreNotesAvailable", "No more notes available")}
                    </p>
                  </div>
                ) : (
                  <div>
                    {t("page", "Page")} {currentPage} {t("of", "of")}{" "}
                    {totalPages}
                  </div>
                )}
                <div>
                  {showNextButton && (
                    <button
                      onClick={nextPage}
                      className={`${styles.navButton} omrs-bold omrs-btn omrs-text-neutral omrs-rounded`}
                    >
                      {t("next", "Next")}
                      <svg
                        className="omrs-icon"
                        fill="var(--omrs-color-ink-low-contrast)"
                      >
                        <use xlinkHref="#omrs-icon-chevron-right" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </SummaryCard>
          ) : (
            <EmptyState
              displayText={t("notes", "notes")}
              headerTitle={t("notes", "Notes")}
              launchForm={() =>
                openWorkspaceTab(VisitNotes, `${t("visitNote", "Visit Note")}`)
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default NotesDetailedSummary;
