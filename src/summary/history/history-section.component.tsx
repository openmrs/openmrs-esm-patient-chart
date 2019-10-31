import React from "react";
import { match } from "react-router";
import SummarySectionCards from "../cards/summary-section-cards.component";
import AllergyCard from "./allergy-card.component";
import { getCurrentPatient } from "@openmrs/esm-api";
import ConditionsCard from "./conditions-card.component";

export default function HistorySection(props: HistorySectionProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient =>
      setCurrentPatient(patient)
    );

    return () => subscription.unsubscribe();
  });

  return (
    <>
      {currentPatient && (
        <SummarySectionCards match={props.match}>
          <ConditionsCard match={props.match} currentPatient={currentPatient} />
          <AllergyCard match={props.match} currentPatient={currentPatient} />
        </SummarySectionCards>
      )}
    </>
  );
}

type HistorySectionProps = {
  match: match;
};
