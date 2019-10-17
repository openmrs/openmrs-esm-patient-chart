import React from "react";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import { match } from "react-router";

export default function ContactsCard(props: ContactsCardProps) {
  return (
    <SummaryCard name="Contact & Address" match={props.match}>
      {props.patient &&
        props.patient.telecom &&
        props.patient.telecom.map(contact => (
          <SummaryCardRow linkTo="/" key={contact.system}>
            <SummaryCardRowContent>
              <VerticalLabelValue
                label={contact.system}
                value={contact.value}
              />
            </SummaryCardRowContent>
          </SummaryCardRow>
        ))}
    </SummaryCard>
  );
}

type ContactsCardProps = {
  match: match;
  patient: fhir.Patient;
};
