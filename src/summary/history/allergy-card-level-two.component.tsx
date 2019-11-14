import React from "react";
import { match } from "react-router";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import styles from "./allergy-card-level-two.css";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import SummaryCard from "../cards/summary-card.component";
import dayjs from "dayjs";

export function AllergyCardLevelTwo(props: AllergyCardLevelTwoProps) {
  const [patientAllergy, setPatientAllergy] = React.useState(null);

  React.useEffect(() => {
    const abortController = new AbortController();

    performPatientAllergySearch(
      props.currentPatient.identifier[0].value,
      abortController
    )
      .then(allergy => setPatientAllergy(allergy.data))
      .catch(createErrorHandler());

    return () => abortController.abort();
  }, [props.currentPatient.identifier[0].value]);

  function displayAllergy() {
    return (
      <SummaryCard
        name="Allergy"
        match={props.match}
        styles={{ width: "100%" }}
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
                          <span>
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

  function displayNoDrugAllergy() {
    return (
      <SummaryCard
        name="Allergy"
        match={props.match}
        styles={{ width: "100%" }}
      >
        <SummaryCardRow>
          <SummaryCardRowContent>
            <HorizontalLabelValue
              label="ALLERGEN"
              labelStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
              value="UPDATED"
              valueStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
            />
          </SummaryCardRowContent>
        </SummaryCardRow>

        <SummaryCardRow>
          <HorizontalLabelValue
            label="Patient does not have known allergies"
            labelClassName="omrs-bold"
            value="June 2019"
            valueStyles={{
              color: "var(--omrs-color-ink-medium-contrast)",
              marginRight: "1.625rem"
            }}
          />
        </SummaryCardRow>
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
    <div className={styles.allergySummary}>
      {patientAllergy ? displayAllergy() : displayNoAllergenHistory()}
    </div>
  );
}

type AllergyCardLevelTwoProps = {
  currentPatient: fhir.Patient;
  match: match;
};
