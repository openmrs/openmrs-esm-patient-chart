import React, { useState, useEffect } from "react";
import styles from "./notes-card-style.css";

export default function Pagination(props: PaginationProps) {
  const [emptyResult, setEmptyResult] = useState(false);
  const [pageNumbers, setPageNumbers] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showPreviousButton, setShowPreviousButton] = useState(false);
  let indexOfLastResult: number = currentPage * resultsPerPage;
  let indexOfFirstResult: number = indexOfLastResult - resultsPerPage;
  useEffect(() => {
    currentPage * resultsPerPage > totalData
      ? setShowNextButton(false)
      : setShowNextButton(true);
    currentPage !== 1
      ? setShowPreviousButton(true)
      : setShowPreviousButton(false);
    paginate();
  }, [totalData, currentPage, resultsPerPage]);
  useEffect(() => {
    setTotalData(props.totalData);
    setResultsPerPage(props.resultsPerPage);
    setPageNumbers(Math.ceil(props.totalData / props.resultsPerPage));
  }, [props]);
  return (
    <table style={{ width: "100%" }}>
      <tbody>
        <tr
          style={{
            backgroundColor: "var(--omrs-color-bg-medium-contrast)",
            color: "var(--omrs-color-ink-medium-contrast)",
            padding: "0.625rem 1.625rem 0.625rem 1rem"
          }}
        >
          {showPreviousButton && (
            <td className={styles.moreNotes}>
              <button
                className={styles.moreNotes}
                onClick={() => previousPage()}
              >
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
            <td>
              <button className={styles.moreNotes} onClick={() => nextPage()}>
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
    setCurrentPage(currentPage + 1);
  }
  function previousPage() {
    indexOfFirstResult = indexOfFirstResult - resultsPerPage;
    indexOfLastResult = indexOfFirstResult + resultsPerPage;
    setCurrentPage(currentPage - 1);
  }
  function paginate() {
    props.paginate(indexOfFirstResult, indexOfLastResult);
  }
}
type PaginationProps = {
  resultsPerPage: number;
  totalData: number;
  paginate: Function;
};
