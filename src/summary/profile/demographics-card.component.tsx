import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import dayjs from "dayjs";
import { age } from "./age-helpers";

export default function DemographicsCard(props: DemographicsCardProps) {
  return (
    <SummaryCard name="Demographics" match={props.match}>
      <SummaryCardRow linkTo="/">
        <SummaryCardRowContent>
          <VerticalLabelValue
            label="Family"
            value={
              props.currentPatient && props.currentPatient.name[0].family + ","
            }
            valueStyles={{
              textTransform: "uppercase"
            }}
          />
          <VerticalLabelValue
            label="Given"
            value={
              props.currentPatient &&
              props.currentPatient.name[0].given.join(" ")
            }
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="/">
        <SummaryCardRowContent justifyContent="space-between">
          <VerticalLabelValue
            label="Birth Date"
            value={
              props.currentPatient &&
              dayjs(props.currentPatient.birthDate).format("DD-MMM-YYYY")
            }
          />
          <VerticalLabelValue
            label="Age"
            value={props.currentPatient && age(props.currentPatient.birthDate)}
          />
          <VerticalLabelValue
            label="Gender"
            value={props.currentPatient && props.currentPatient.gender}
            valueStyles={{ textTransform: "capitalize" }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
    </SummaryCard>
  );
}

type DemographicsCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
