import React from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import { performPatientAllergySearch } from "./allergy-intolerance.resource";
import style from "./allergy-overview.css";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function AllergyOverview(props: AllergyOverviewProps) {
  const [patientAllergy, setPatientAllergy] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    if (patient) {
      const abortController = new AbortController();

      performPatientAllergySearch(patient.identifier[0].value, abortController)
        .then(allergy => setPatientAllergy(allergy.data))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [patient]);

  return (
    <SummaryCard
      name="Allergies"
      match={props.match}
      styles={{ margin: "1.25rem, 1.5rem" }}
      link={`/patient/${patientUuid}/chart/allergies`}
    >
      {patientAllergy &&
        patientAllergy.total > 0 &&
        patientAllergy.entry.map(allergy => {
          return (
            <SummaryCardRow
              key={allergy.resource.id}
              linkTo={`/patient/${patientUuid}/chart/allergies`}
            >
              <HorizontalLabelValue
                label={allergy.resource.code.text}
                labelClassName="omrs-bold"
                labelStyles={{ flex: "1" }}
                value={`${
                  allergy.resource.reaction[0].manifestation[0].text
                } (${
                  allergy.resource.criticality === "?"
                    ? "\u2014"
                    : allergy.resource.criticality
                })`}
                valueStyles={{ flex: "1", paddingLeft: "1rem" }}
                valueClassName={style.allergyReaction}
              />
            </SummaryCardRow>
          );
        })}
    </SummaryCard>
  );
}

type AllergyOverviewProps = {
  match: match;
};
