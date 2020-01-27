import React from "react";
import style from "./conditions-card-style.css";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import { match } from "react-router";
import { performPatientConditionsSearch } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import { useTranslation } from "react-i18next";

export default function ConditionsOverview(props: ConditionsOverviewProps) {
  const [patientConditions, setPatientConditions] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (patient) {
      const abortController = new AbortController();
      performPatientConditionsSearch(
        patient.identifier[0].value,
        abortController
      )
        .then(condition => setPatientConditions(condition))
        .catch(createErrorHandler());

      return () => abortController.abort();
    }
  }, [patient]);

  return (
    <SummaryCard
      name={t("conditions", "Conditions")}
      match={props.match}
      styles={{ margin: "1.25rem, 1.5rem" }}
    >
      <SummaryCardRow>
        <SummaryCardRowContent>
          <HorizontalLabelValue
            label="Active Conditions"
            labelStyles={{
              color: "var(--omrs-color-ink-medium-contrast)",
              fontFamily: "Work Sans"
            }}
            value="Since"
            valueStyles={{
              color: "var(--omrs-color-ink-medium-contrast)",
              fontFamily: "Work Sans"
            }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
      {patientConditions &&
        patientConditions.entry.map(condition => {
          return (
            <SummaryCardRow
              key={condition.resource.id}
              linkTo={`/patient/${patientUuid}/chart/conditions`}
            >
              <HorizontalLabelValue
                label={condition.resource.code.text}
                labelStyles={{ fontWeight: 500 }}
                value={dayjs(condition.resource.onsetDateTime).format(
                  "MMM-YYYY"
                )}
                valueStyles={{ fontFamily: "Work Sans" }}
              />
            </SummaryCardRow>
          );
        })}
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/conditions`} />
    </SummaryCard>
  );
}

type ConditionsOverviewProps = {
  match: match;
};
