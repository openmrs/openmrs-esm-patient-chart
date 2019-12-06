import React from "react";
import { match } from "react-router";
import SummarySectionCards from "../cards/summary-section-cards.component";
import AllergyCard from "./allergy-card.component";
import ConditionsCard from "./conditions-card.component";
import NotesCard from "./notes-card.component";
import ProgramsCard from "./programs/programs-card.component";
import MedicationsLevelOne from "./medications/medications-level-one.component";

export default function HistorySection(props: HistorySectionProps) {
  return (
    <div>
      <SummarySectionCards match={props.match}>
        <ConditionsCard match={props.match} />
        <ProgramsCard match={props.match} />
      </SummarySectionCards>
      <SummarySectionCards>
        <AllergyCard match={props.match} />
      </SummarySectionCards>
      <SummarySectionCards match={props.match}>
        <MedicationsLevelOne match={props.match} />
      </SummarySectionCards>
      <SummarySectionCards match={props.match}>
        <NotesCard match={props.match} />
      </SummarySectionCards>
    </div>
  );
}

type HistorySectionProps = {
  match: match;
};
