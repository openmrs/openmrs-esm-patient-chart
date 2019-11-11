import React from "react";
import { match } from "react-router";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import styles from "./allergy-card-level-two.css";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import SummaryCard from "../cards/summary-card.component";

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
        <div className={styles.allergyContent}>
          <div className={`omrs-type-body-regular ${styles.allergyRow}`}>
            <p className="omrs-bold">Penicillin</p>
            <p className={styles.allergyRowManifestation}>
              <span className="omrs-bold">
                <svg
                  className={`omrs-icon ${styles.headerIcons}`}
                  fill="rgba(181, 7, 6, 1)"
                >
                  <use xlinkHref="#omrs-icon-important-notification" />
                </svg>
                SEVERE
              </span>
              <span className="omrs-type-body-regular omrs-bold">
                <p className="omrs-bold">Analphysic GI upset</p>
              </span>
            </p>
            <p>Jun-2006</p>
            <p>31-Jun-2019</p>
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
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Optio
                aliquam quod, corporis quas delectus sapiente accusamus mollitia
                similique illum iure incidunt nobis placeat! Maiores cupiditate
                libero explicabo labore? Deleniti, hic!
              </p>
              <p>more ...</p>
            </p>
          </div>
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

        <SummaryCardRow linkTo="/">
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
          {null}
        </SummaryCard>
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
      </div>
    );
  }

  return <div className={styles.patientSummary}>{displayAllergy()}</div>;
}

type AllergyCardLevelTwoProps = {
  currentPatient: fhir.Patient;
  match: match;
};
