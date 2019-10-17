import React from "react";
import { match } from "react-router";
import SummarySectionHeader from "../summary-section-header.component";
import SummarySectionCards from "../cards/summary-section-cards.component";
import DemographicsCard from "./demographics-card.component";
import IdentifiersCard from "./identifiers-card.component";
import ContactsCard from "./contacts-card.component";
import RelationshipsCard from "./relationships-card.component";

export default function ProfileSection(props: ProfileSectionProps) {
  return (
    <>
      <SummarySectionHeader match={props.match} name="Profile" />
      <SummarySectionCards match={props.match}>
        <DemographicsCard match={props.match} patient={props.patient} />
        <IdentifiersCard match={props.match} patient={props.patient} />
        <ContactsCard match={props.match} patient={props.patient} />
        <RelationshipsCard match={props.match}></RelationshipsCard>
      </SummarySectionCards>
    </>
  );
}

type ProfileSectionProps = {
  match: match;
  patient: fhir.Patient;
};
