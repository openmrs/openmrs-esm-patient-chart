import React from "react";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import { match } from "react-router";

export default function ContactsCard(props: ContactsCardProps) {
  function getAddress(address: fhir.Address) {
    return (
      <div>
        <div>{address.line}</div>
        <div>
          {address.city}, {address.state}
        </div>
        <div>{address.country}</div>
      </div>
    );
  }

  return (
    <SummaryCard name="Contact & Address" match={props.match}>
      {props.patient && props.patient.address ? (
        props.patient.address.map(address => (
          <SummaryCardRow key={address.id}>
            <SummaryCardRowContent>
              <VerticalLabelValue
                label={address.use}
                value={getAddress(address)}
              />
            </SummaryCardRowContent>
          </SummaryCardRow>
        ))
      ) : (
        <SummaryCardRow>
          <SummaryCardRowContent>{"\u2014"}</SummaryCardRowContent>
        </SummaryCardRow>
      )}
      {props.patient && props.patient.telecom ? (
        props.patient.telecom.map(contact => (
          <SummaryCardRow key={contact.system}>
            <SummaryCardRowContent>
              <VerticalLabelValue
                label={contact.system}
                value={contact.value}
              />
            </SummaryCardRowContent>
          </SummaryCardRow>
        ))
      ) : (
        <SummaryCardRow>
          <SummaryCardRowContent>{"\u2014"}</SummaryCardRowContent>
        </SummaryCardRow>
      )}
    </SummaryCard>
  );
}

type ContactsCardProps = {
  match: match;
  patient: fhir.Patient;
};
