import React from "react";
import { match } from "react-router";
import SummarySectionCards from "../cards/summary-section-cards.component";
import DimensionsCard from "./dimensions-card.component";
import VitalsCard from "./vitals-card.component";

export default function DocumentationSection(props: DocumentationSectionProps) {
  return (
    <>
      <SummarySectionCards match={props.match}>
        <VitalsCard match={props.match} />
        <DimensionsCard match={props.match} />
      </SummarySectionCards>
    </>
  );
}

type DocumentationSectionProps = {
  match: match;
};
