import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";

export default function RelationshipsCard(props: RelationshipsCardProps) {
  return (
    <SummaryCard name="Relationships" match={props.match}>
      <></>
    </SummaryCard>
  );
}

type RelationshipsCardProps = {
  match: match;
  patient: fhir.Patient;
};
