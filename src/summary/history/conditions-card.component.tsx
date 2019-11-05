import React from "react";
import style from "./conditions-card-style.css";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import { match } from "react-router";
import { performPatientConditionSearch } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";

export default function ConditionsCard(props: ConditionsCardProps) {
  const [patientConditions, setPatientConditions] = React.useState(null);

  React.useEffect(() => {
    const abortController = new AbortController();
    performPatientConditionSearch(
      props.currentPatient.identifier[0].value,
      abortController
    )
      .then(condition => setPatientConditions(condition))
      .catch(createErrorHandler());

    return () => abortController.abort();
  });

  return (
    <SummaryCard name="Conditions" match={props.match}>
      <SummaryCardRow>
        <SummaryCardRowContent>
          <HorizontalLabelValue
            label="Active Conditions"
            labelStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
            value="Since"
            valueStyles={{ color: "var(--omrs-color-ink-medium-contrast)" }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
      {patientConditions &&
        patientConditions.entry.map(condition => {
          return (
            <SummaryCardRow key={condition.resource.id} linkTo="/">
              <HorizontalLabelValue
                label={condition.resource.code.text}
                labelClassName="omrs-bold"
                value={dayjs(condition.resource.onsetDateTime).format(
                  "MMM-YYYY"
                )}
              />
            </SummaryCardRow>
          );
        })}
      <div className={style.conditionMore}>
        <svg className="omrs-icon">
          <use
            xlinkHref="#omrs-icon-chevron-down"
            fill="var(--omrs-color-ink-low-contrast)"
          ></use>
        </svg>
        <p>more</p>
      </div>
    </SummaryCard>
  );
}

type ConditionsCardProps = {
  match: match;
  currentPatient: any;
};
