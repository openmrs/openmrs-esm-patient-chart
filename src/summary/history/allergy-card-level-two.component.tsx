import React from "react";
import { match } from "react-router";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import styles from "./allergy-card-level-two.css";
import SummaryCard from "../cards/summary-card.component";
import dayjs from "dayjs";
import { useCurrentPatient } from "@openmrs/esm-api";

export function AllergyCardLevelTwo(props: AllergyCardLevelTwoProps) {
  const [patientAllergy, setPatientAllergy] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    if (!isLoadingPatient && patient) {
      const abortController = new AbortController();

      performPatientAllergySearch(patient.identifier[0].value, abortController)
        .then(allergy => setPatientAllergy(allergy.data))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [isLoadingPatient, patient]);

  function displayAllergy() {
    return (
      <SummaryCard
        name="Allergy"
        match={props.match}
        styles={{ width: "100%" }}
        addBtnUrl={`/patient/${patientUuid}/chart/allergy/add`}
      >
        <table className={styles.allergyTable}>
          <thead>
            <tr>
              <td>ALLERGEN</td>
              <td>
                <div className={styles.centerItems}>
                  SEVERITY & REACTION
                  <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                    <use xlinkHref="#omrs-icon-arrow-downward" />
                  </svg>
                </div>
              </td>
              <td>SINCE</td>
              <td>UPDATED</td>
            </tr>
          </thead>
          <tbody>
            {patientAllergy &&
              patientAllergy.entry.map(allergy => {
                return (
                  <React.Fragment key={allergy.resource.id}>
                    <tr
                      className={`${
                        allergy.resource.criticality === "high"
                          ? `${styles.high}`
                          : `${styles.low}`
                      }`}
                    >
                      <td className={"omrs-bold"}>
                        {allergy.resource.code.text}
                      </td>
                      <td>
                        <div
                          className={`${styles.centerItems} ${
                            allergy.resource.criticality === "high"
                              ? `omrs-bold`
                              : ``
                          }`}
                          style={{ textTransform: "uppercase" }}
                        >
                          {allergy.resource.criticality === "high" && (
                            <svg
                              className={`omrs-icon`}
                              fontSize={"15px"}
                              fill="rgba(181, 7, 6, 1)"
                            >
                              <use xlinkHref="#omrs-icon-important-notification" />
                            </svg>
                          )}
                          {allergy.resource.criticality}
                        </div>
                      </td>
                      <td>
                        {dayjs(
                          allergy.resource.extension[0].valueDateTime
                        ).format("MMM-YYYY")}
                      </td>
                      <td>
                        <div
                          className={`${styles.centerItems} ${styles.alignRight}`}
                        >
                          <span>
                            {dayjs(patientAllergy.meta.lastUpdated).format(
                              "DD-MMM-YYYY"
                            )}
                          </span>
                          <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                            <use xlinkHref="#omrs-icon-chevron-right" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colSpan={3}>
                        {Object.values(
                          allergy.resource.reaction[0].manifestation.map(
                            manifestation => manifestation.text
                          )
                        ).join(", ")}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colSpan={3}>
                        <span className={`${styles.allergyComment}`}>
                          <span style={{ whiteSpace: "pre-line" }}>
                            {allergy.resource.note &&
                              allergy.resource.note[0].text}
                          </span>
                          <span>more...</span>
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
        <div className={styles.allergyFooter}>
          <p
            style={{ color: "var(--omrs-color-ink-medium-contrast)" }}
            className={"omrs-type-body-large"}
          >
            No more allergies available
          </p>
        </div>
      </SummaryCard>
    );
  }

  function displayNoAllergenHistory() {
    return (
      <SummaryCard
        name="Allergy"
        match={props.match}
        styles={{ width: "100%" }}
      >
        <div className={styles.allergyMargin}>
          <p className="omrs-bold">
            The patient's allergy history is not documented.
          </p>
          <p className="omrs-bold">
            Please <a href="/">add allergy history</a>.
          </p>
        </div>
      </SummaryCard>
    );
  }

  return (
    <>
      {patientAllergy && (
        <div className={styles.allergySummary}>
          {patientAllergy.total > 0
            ? displayAllergy()
            : displayNoAllergenHistory()}
        </div>
      )}
    </>
  );
}

type AllergyCardLevelTwoProps = {
  match: match;
};
