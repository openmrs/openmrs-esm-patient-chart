import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import HorizontalSectionCard from "../cards/horizontal-section-card.component";
export default function VitalsCard(props: VitalsCardProps) {
  return (
    <SummaryCard name="Vitals" match={props.match}>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent>
          <HorizontalSectionCard>
            <VerticalLabelValue
              label="today"
              value="14:40"
              valueStyles={{
                color: "grey"
              }}
            />
            <VerticalLabelValue
              label="today"
              value="14:40"
              valueStyles={{
                color: "grey"
              }}
            />
          </HorizontalSectionCard>
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent justifyContent="space-between">
          <div>BP</div>
          <div>153/89</div>
          <div>153/89</div>
          <div>mmHg</div>
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent justifyContent="space-between">
          <div>Pulse</div>
          <div>67</div>
          <div>67</div>
          <div>bpm</div>
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent justifyContent="space-between">
          <div>Oxygen</div>
          <div>97</div>
          <div>97</div>
          <div>%</div>
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent justifyContent="space-between">
          <div>Temp</div>
          <div>36.4</div>
          <div>36.4</div>
          <div>C</div>
        </SummaryCardRowContent>
      </SummaryCardRow>
    </SummaryCard>
  );
}

type VitalsCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
