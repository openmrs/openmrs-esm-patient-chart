import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";

export default function VitalsCard(props: VitalsCardProps) {
  return (
    <SummaryCard name="Vitals" match={props.match}>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent>
          <VerticalLabelValue label="Today" value={"14:04 PM"} />
          <VerticalLabelValue label="01-Sept" value={"2018"} />
        </SummaryCardRowContent>
      </SummaryCardRow>
    </SummaryCard>
  );
}

type VitalsCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
