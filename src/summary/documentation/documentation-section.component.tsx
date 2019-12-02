import React from "react";
import { match } from "react-router";
import SummarySectionCards from "../cards/summary-section-cards.component";
import DimensionsCard from "./dimensions-card.component";
import VitalsCard from "./vitals-card.component";

export default function DocumentationSection(props: DocumentationSectionProps) {
  return (
    <div>
      <SummarySectionCards match={props.match}>
        <VitalsCard match={props.match} />
      </SummarySectionCards>

      <SummarySectionCards match={props.match}>
        <DimensionsCard match={props.match} />
      </SummarySectionCards>
    </div>
  );
}

type DocumentationSectionProps = {
  match: match;
};
