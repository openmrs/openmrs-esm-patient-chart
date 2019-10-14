import React from "react";
import { getCurrentPatient } from "@openmrs/esm-api";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import dayjs from "dayjs";
import { age } from "./age-helpers";

export default function DemographicsCard(props: DemographicsCardProps) {
  const [currentPatient, setCurrentPatient] = React.useState(null);

  React.useEffect(() => {
    const subscription = getCurrentPatient().subscribe(patient =>
      setCurrentPatient(patient)
    );

    return () => subscription.unsubscribe();
  });

  return (
    <SummaryCard name="Demographics" match={props.match}>
      <SummaryCardRow linkTo="/">
        <SummaryCardRowContent>
          <VerticalLabelValue
            label="Family"
            value={currentPatient && currentPatient.name[0].family + ","}
            valueStyles={{
              textTransform: "uppercase"
            }}
          />
          <VerticalLabelValue
            label="Given"
            value={currentPatient && currentPatient.name[0].given.join(" ")}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
      <SummaryCardRow linkTo="/">
        <SummaryCardRowContent justifyContent="space-between">
          <VerticalLabelValue
            label="Birth Date"
            value={
              currentPatient &&
              dayjs(currentPatient.birthDate).format("DD-MMM-YYYY")
            }
          />
          <VerticalLabelValue
            label="Age"
            value={currentPatient && age(currentPatient.birthDate)}
          />
          <VerticalLabelValue
            label="Gender"
            value={currentPatient && currentPatient.gender}
            valueStyles={{ textTransform: "capitalize" }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
    </SummaryCard>
  );
}

type DemographicsCardProps = {
  match: match;
};
