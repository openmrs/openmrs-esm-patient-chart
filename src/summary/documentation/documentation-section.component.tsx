import React from "react";
import { match } from "react-router";
import { getCurrentPatient } from "@openmrs/esm-api";
import SummarySectionHeader from "../summary-section-header.component";
import SummarySectionCards from "../cards/summary-section-cards.component";
import VitalsCard from "./vitals-card.component";

export default function DocumentationSection(props: DocumentationSectionProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
    });

    return () => subscription.unsubscribe();
  });

  return (
    <>
      <SummarySectionHeader match={props.match} name="Documentation" />
      <SummarySectionCards match={props.match}>
        <VitalsCard match={props.match} currentPatient={currentPatient} />
      </SummarySectionCards>
    </>
  );
}

type DocumentationSectionProps = {
  match: match;
};
