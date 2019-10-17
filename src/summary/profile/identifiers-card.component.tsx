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

  function isPreferred(identifier) {
    return identifier.use === "usual";
  }

  function preferredIdFirst(identifier1, identifier2) {
    return isPreferred(identifier1) ? -1 : isPreferred(identifier2) ? 1 : 0;
  }

  return (
    <SummaryCard name="Identifiers" match={props.match}>
      {props.patient &&
        props.patient.identifier
          .sort((id_a, id_b) => preferredIdFirst(id_a, id_b))
          .map(id => (
            <SummaryCardRow linkTo="/" key={id.system}>
              <SummaryCardRowContent>
                <HorizontalLabelValue
                  label={id.system}
                  value={id.value}
                  labelStyles={labelStyles}
                  valueStyles={valueStyles}
                  specialKey={isPreferred(id)}
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
  patient: fhir.Patient;
  match: match;
};
