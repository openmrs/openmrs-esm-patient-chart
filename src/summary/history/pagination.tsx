import React, { useState, useEffect } from "react";
import styles from "./notes-card-style.css";

export default function Pagination(props: PaginationProps) {
  const [emptyResult, setEmptyResult] = useState(false);
  const [pageNumbers, setPageNumbers] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  let indexOfLastResult: number = currentPage * resultsPerPage;
  let indexOfFirstResult: number = indexOfLastResult - resultsPerPage;
  useEffect(() => {
    currentPage * resultsPerPage > props.totalData
      ? setShowNextButton(false)
      : setShowNextButton(true);
    currentPage !== 1
      ? setShowPreviousButton(true)
      : setShowPreviousButton(false);
  }, [props.totalData, currentPage]);
  useEffect(() => {
    setResultsPerPage(props.resultsPerPage);
    setPageNumbers(Math.ceil(props.totalData / resultsPerPage));
    props.paginate(indexOfFirstResult, indexOfLastResult);
  }, [props.totalData, props.resultsPerPage]);
  return (
    <table style={{ width: "100%" }}>
      <tbody>
        <tr>
          {showPreviousButton && (
            <td className={styles.moreNotes}>
              <button onClick={() => previousPage()}>
                <svg
                  className="omrs-icon"
                  fill="var(--omrs-color-ink-low-contrast)"
                >
                  <use xlinkHref="#omrs-icon-chevron-left" />
                </svg>
                <span>Previous</span>
              </button>
            </td>
          )}
          <td
            style={{
              backgroundColor: "var(--omrs-color-bg-medium-contrast)",
              color: "var(--omrs-color-ink-medium-contrast)",
              padding: "0.625rem 1.625rem 0.625rem 1rem"
            }}
          >
            page {currentPage} of {pageNumbers}
          </td>
          {showNextButton && (
            <td className={styles.moreNotes}>
              <button onClick={() => nextPage()}>
                <svg
                  className="omrs-icon"
                  fill="var(--omrs-color-ink-low-contrast)"
                >
                  <use xlinkHref="#omrs-icon-chevron-right" />
                </svg>
                <span>Next</span>
              </button>
            </td>
          )}
        </tr>
      </tbody>
    </table>
  );
  function nextPage() {
    indexOfFirstResult = indexOfLastResult;
    indexOfLastResult = indexOfFirstResult + resultsPerPage;
    props.paginate(indexOfFirstResult, indexOfLastResult);
    setCurrentPage(currentPage + 1);
  }
  function previousPage() {
    indexOfFirstResult = indexOfFirstResult - resultsPerPage;
    indexOfLastResult = indexOfFirstResult + resultsPerPage;
    props.paginate(indexOfFirstResult, indexOfLastResult);
    setCurrentPage(currentPage - 1);
  }
}
type PaginationProps = {
  resultsPerPage: number;
  totalData: number;
  paginate: Function;
};
