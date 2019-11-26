import React from "react";
import { match } from "react-router";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { fetchPatientRelationships } from "./relationships.resource";
import SummaryCard from "../cards/summary-card.component";
import SummaryCardRow from "../cards/summary-card-row.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";

export default function RelationshipsCard(props: RelationshipsCardProps) {
  const [relationships, setRelationships] = React.useState(null);
  React.useEffect(() => {
    fetchPatientRelationships(props.patient.identifier[0].value)
      .then(({ data }) => {
        if (data.total > 0) {
          setRelationships(getRelationships(data.entry));
        }
      })
      .catch(createErrorHandler());
  }, [props.patient.identifier]);

  return (
    <SummaryCard name="Relationships" match={props.match}>
      {relationships && relationships.length ? (
        relationships.map((relation: fhir.RelatedPerson) => (
          <SummaryCardRow key={relation.id}>
            <SummaryCardRowContent>
              <VerticalLabelValue
                label={relation.relationship.coding[0].code}
                value={getRelativeName(relation.name)}
              />
            </SummaryCardRowContent>
          </SummaryCardRow>
        ))
      ) : (
        <SummaryCardRow>
          <SummaryCardRowContent>{"\u2014"}</SummaryCardRowContent>
        </SummaryCardRow>
      )}
    </SummaryCard>
  );
}

function getRelationships(relations) {
  return relations.map(relation => relation.resource);
}

function getRelativeName(name) {
  return `${name[0].given.join(" ")} ${name[0].family}`;
}
type RelationshipsCardProps = {
  match: match;
  patient: fhir.Patient;
};
