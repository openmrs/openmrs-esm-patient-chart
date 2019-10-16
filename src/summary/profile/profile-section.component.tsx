import React from "react";
import { match } from "react-router";
import { getCurrentPatient } from "@openmrs/esm-api";
import SummarySectionHeader from "../summary-section-header.component";
import SummarySectionCards from "../cards/summary-section-cards.component";
import DemographicsCard from "./demographics-card.component";
import IdentifiersCard from "./identifiers-card.component";
import ContactsCard from "./contacts-card.component";

export default function ProfileSection(props: ProfileSectionProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient => {
      setCurrentPatient(patient);
    });

    return () => subscription.unsubscribe();
  });

  return (
    <>
      <SummarySectionHeader match={props.match} name="Profile" />
      <SummarySectionCards match={props.match}>
        <DemographicsCard match={props.match} currentPatient={currentPatient} />
        <IdentifiersCard match={props.match} currentPatient={currentPatient} />
        <ContactsCard match={props.match} currentPatient={currentPatient} />
      </SummarySectionCards>
    </>
  );
}

type ProfileSectionProps = {
  match: match;
};
