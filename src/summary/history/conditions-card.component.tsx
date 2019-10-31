import React from "react";
import style from "./conditions-card-style.css";
import dayjs from "dayjs";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import { match } from "react-router";
import { performPatientConditionSearch } from "./conditions.resource";
import { createErrorHandler } from "@openmrs/esm-error-handling";

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
      <div className={style.conditionHeader}>
        <div>Active Conditions</div>
        <div>Since</div>
      </div>
      {patientConditions &&
        patientConditions.entry.map(condition => {
          return (
            <SummaryCardRow key={condition.resource.id} linkTo="/">
              <SummaryCardRowContent>
                <div className={style.conditionsRow}>
                  <p className={`omrs-bold ${style.conditionName}`}>
                    {condition.resource.code.text}
                  </p>
                  <p className={`${style.conditionDate}`}>
                    {dayjs(condition.resource.onsetDateTime).format("MMM-YYYY")}
                  </p>
                </div>
              </SummaryCardRowContent>
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
