import React from "react";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import { match } from "react-router";

export default function IdentifiersCard(props: IdentifiersCardProps) {
  const labelStyles = {
    color: "var(--omrs-color-ink-medium-contrast)"
  };

  const valueStyles = {
    color: "var(--omrs-color-ink-high-contrast)",
    fontWeight: 500
  };

  return (
    <SummaryCard name="Identifiers" match={props.match}>
      {props.currentPatient &&
        props.currentPatient.identifier.map(id => (
          <SummaryCardRow linkTo="/" key={id.system}>
            <SummaryCardRowContent>
              <HorizontalLabelValue
                label={id.system}
                value={id.value}
                labelStyles={labelStyles}
                valueStyles={valueStyles}
                specialKey={id.use === "usual"}
              ></HorizontalLabelValue>
            </SummaryCardRowContent>
          </SummaryCardRow>
        ))}
      <div className="omrs-padding-left-16">
        <span className="omrs-type-body-small" style={labelStyles}>
          * Preferred ID
        </span>
      </div>
    </SummaryCard>
  );
}

type IdentifiersCardProps = {
  currentPatient: fhir.Patient;
  match: match;
};
