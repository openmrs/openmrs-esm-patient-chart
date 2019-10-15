import React from "react";
import { match } from "react-router";
import SummarySectionHeader from "../summary-section-header.component";
import SummarySectionCards from "../cards/summary-section-cards.component";
import DemographicsCard from "./demographics-card.component";

export default function ProfileSection(props: ProfileSectionType) {
  return (
    <>
      <SummarySectionHeader match={props.match} name="Profile" />
      <SummarySectionCards match={props.match}>
        <DemographicsCard match={props.match} />
      </SummarySectionCards>
    </>
  );
}

type ProfileSectionType = {
  match: match;
};
