import React from "react";
import SummaryCard from "../cards/summary-card.component";
import { match } from "react-router";
import { getPatientDimensions } from "./observation.resource";
import SummaryCardRow from "../cards/summary-card-row.component";
import VerticalLabelValue from "../cards/vertical-label-value.component";
import SummaryCardRowContent from "../cards/summary-card-row-content.component";
import HorizontalSectionCard from "../cards/horizontal-section-card.component";
import DimensionsSectionCard from "./dimensions-card-row.component";
import * as timeago from "timeago.js";
import ShowMoreCard from "./show-more-card.component";
import style from "./dimensions-card.css";
import { createErrorHandler } from "@openmrs/esm-error-handling";

export default function DimensionsCard(props: DimensionsCardProps) {
  const [dimensions, setDimensions] = React.useState([]);
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    const abortController = new AbortController();
    getPatientDimensions(
      props.currentPatient.identifier[0].value,
      abortController
    )
      .then(response => {
        const entries = response.data.entry
          .filter(
            el =>
              el.resource.valueQuantity &&
              (el.resource.valueQuantity.unit === "cm" ||
                el.resource.valueQuantity.unit === "kg" ||
                el.resource.valueQuantity.unit === undefined)
          )
          .map(m => m.resource);
        const res = [];
        for (let i = 0; i < entries.length; i += 3) {
          res.push({
            date: timeago.format(new Date(entries[i].effectiveDateTime)),
            cm: entries[i].valueQuantity.value,
            kg: entries[i + 1].valueQuantity.value,
            bmi: entries[i + 2].valueQuantity.value
          });
        }
        setDimensions(res);
      })
      .catch(createErrorHandler());

    return () => abortController.abort();
  }, [props.currentPatient.identifier[0].value]);
  return (
    <SummaryCard
      name="Height & Weight"
      match={props.match}
      styles={{ width: "40rem" }}
    >
      <SummaryCardRow>
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
        dimensions
          .slice(0, showMore ? dimensions.length : 3)
          .map((el, index) => {
            return (
              <SummaryCardRow linkTo="/" key={index}>
                <SummaryCardRowContent>
                  <DimensionsSectionCard content={el} index={index} />
                </SummaryCardRowContent>
              </SummaryCardRow>
            );
          })}
      <SummaryCardRow linkTo="">
        <SummaryCardRowContent>
          <ShowMoreCard
            func={() => {
              setShowMore(!showMore);
            }}
          />
        </SummaryCardRowContent>
      </SummaryCardRow>
    </SummaryCard>
  );
}

type DimensionsCardProps = {
  match: match;
  currentPatient: fhir.Patient;
};
