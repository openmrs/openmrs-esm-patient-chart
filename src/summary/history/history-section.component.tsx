import React from "react";
import { match } from "react-router";
import SummarySectionCards from "../../widgets/cards/summary-section-cards.component";
import AllergyCard from "../../widgets/allergies/allergy-card.component";
import ConditionsCard from "../../widgets/conditions/conditions-card.component";
import NotesCard from "../../widgets/notes/notes-card.component";
import ProgramsCard from "../../widgets/programs/programs-card.component";
import MedicationsSummary from "../../widgets/medications/medications-summary.component";

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
        <MedicationsSummary match={props.match} />
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
