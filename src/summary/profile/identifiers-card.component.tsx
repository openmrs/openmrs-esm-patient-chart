import React from "react";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import HorizontalLabelValue from "../cards/horizontal-label-value.component";
import { match } from "react-router";
import VerticalLabelValue from "../cards/vertical-label-value.component";

export default function IdentifiersCard(props: IdentifiersCardProps) {
  const valueStyles = {
    color: "var(--omrs-color-ink-high-contrast)",
    fontWeight: 500
  };

  return (
    <SummaryCard name="Identifiers" match={props.match}>
      {props.patient &&
        props.patient.identifier.sort(preferredIdFirst).map(id => (
          <SummaryCardRow key={id.system}>
            <SummaryCardRowContent justifyContent="space-between">
              <VerticalLabelValue
                label={id.system}
                value={id.value}
                valueStyles={valueStyles}
              ></VerticalLabelValue>
              {isPreferred(id) && (
                <span
                  style={{ color: "var(--omrs-color-ink-medium-contrast)" }}
                  className="omrs-type-body-regular"
                >
                  Preferred ID
                </span>
              )}
            </SummaryCardRowContent>
          </SummaryCardRow>
        ))}
    </SummaryCard>
  );

  function isPreferred(identifier) {
    return identifier.use === "usual";
  }

  function preferredIdFirst(identifier1, identifier2) {
    if (isPreferred(identifier1)) {
      return -1;
    } else if (isPreferred(identifier2)) {
      return 1;
    } else {
      return 0;
    }
  }
}

type IdentifiersCardProps = {
  patient: fhir.Patient;
  match: match;
};
