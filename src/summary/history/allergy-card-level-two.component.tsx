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
        <div className={`omrs-type-body-regular ${styles.allergyHeader}`}>
          <p className="omrs-type-body-regular">ALLERGEN</p>
          <p className="omrs-type-body-regular">SEVERITY & REACTION</p>
          <p className="omrs-type-body-regular">SINCE</p>
          <p className="omrs-type-body-regular">UPDATED</p>
        </div>
        {patientAllergy &&
          patientAllergy.entry.map(allergy => {
            return (
              <>
                <div className={styles.allergyContent}>
                  <div
                    className={`omrs-type-body-regular ${styles.allergyRow}`}
                  >
                    <p className="omrs-bold">{allergy.resource.code.text}</p>
                    <p className={styles.allergyRowManifestation}>
                      <span
                        className="omrs-bold"
                        style={{ textTransform: "uppercase" }}
                      >
                        {allergy.resource.criticality === "high" && (
                          <svg
                            className={`omrs-icon`}
                            fontSize={"15px"}
                            fill="var(--omrs-color-danger)"
                          >
                            <use xlinkHref="#omrs-icon-important-notification" />
                          </svg>
                        )}
                        {allergy.resource.criticality}
                      </span>
                      <span className="omrs-type-body-regular">
                        <p>
                          {allergy.resource.reaction[0].manifestation.map(
                            manifestation => `${manifestation.text} `
                          )}
                        </p>
                      </span>
                    </p>
                    <p>
                      {dayjs(
                        allergy.resource.extension[0].valueDateTime
                      ).format("MMM-YYYY")}
                    </p>
                    <p>
                      {dayjs(patientAllergy.meta.lastUpdated).format(
                        "DD-MMM-YYYY"
                      )}
                    </p>
                    <svg
                      className={`omrs-icon ${styles.headerIcons}`}
                      fill="rgba(0, 0, 0, 0.54)"
                    >
                      <use xlinkHref="#omrs-icon-chevron-right" />
                    </svg>
                  </div>
                  <div className={styles.allergyComment}>
                    <p></p>
                    <p className={styles.allergyCommentText}>
                      <p className="omrs-type-body-large">
                        {allergy.resource.note && allergy.resource.note[0].text}
                      </p>
                      <p>more ...</p>
                    </p>
                  </div>
                </div>
              </>
            );
          })}
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
      <div>
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
              Please{" "}
              <span className={`${styles.allergyLink} omrs-underline`}>
                add allergy history
              </span>
            </p>
          </div>
        </SummaryCard>
      </div>
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
