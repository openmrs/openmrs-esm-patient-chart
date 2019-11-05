import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import { getPatientDimensions } from "./dimensions.resource";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import HorizontalSectionCard from "./horizontal-section-card.component";
import DimensionsSectionCard from "./dimensions-card-row.component";
import { ageConvert } from "./date-helper";
import ShowMoreCard from "./show-more-card.component";
import style from "./dimensions-card.css";
export default function DimensionsCard(props: DimensionsCardProps) {
  const [dimensions, setDimensions] = React.useState([]);
  const [showElements, setShowElements] = React.useState(3);

  React.useEffect(() => {
    const abortController = new AbortController();
    getPatientDimensions(
      props.currentPatient.identifier[0].value,
      abortController
    ).then(response => {
      const ar = response.data.entry
        .filter(
          el =>
            el.resource.valueQuantity !== undefined &&
            (el.resource.valueQuantity.unit === "cm" ||
              el.resource.valueQuantity.unit === "kg" ||
              el.resource.valueQuantity.unit === undefined)
        )
        .map(m => m.resource);
      const res = [];
      for (let i = 0; i < ar.length; i += 3) {
        res.push({
          date: ageConvert(ar[i].effectiveDateTime),
          cm: ar[i].valueQuantity.value,
          kg: ar[i + 1].valueQuantity.value,
          bmi: ar[i + 2].valueQuantity.value
        });
      }
      setDimensions(res);
    });

    return () => abortController.abort();
  }, [props.currentPatient.identifier[0].value]);
  return (
    <SummaryCard name="Height & Weight" match={props.match} cardSize="40rem">
      <SummaryCardRow linkTo="/">
        <SummaryCardRowContent>
          <HorizontalSectionCard>
            <div />
            <div className={style.heightText}>Weight</div>
            <div className={style.heightText}>Height</div>
            <div className={style.heightText}>BMI</div>
          </HorizontalSectionCard>
        </SummaryCardRowContent>
      </SummaryCardRow>
      {dimensions &&
        dimensions.slice(0, showElements).map((el, index) => {
          return (
            <SummaryCardRow linkTo="/">
              <SummaryCardRowContent>
                <DimensionsSectionCard content={el} index={index} />
              </SummaryCardRowContent>
            </SummaryCardRow>
          );
        })}
      <SummaryCardRowContent>
        <ShowMoreCard
          func={() => {
            setShowElements(dimensions.length + 3 - showElements);
          }}
        />
      </SummaryCardRowContent>
    </SummaryCard>
  );
}

type DimensionsCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
