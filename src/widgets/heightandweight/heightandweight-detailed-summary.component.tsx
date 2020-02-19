import React, { useState, useEffect } from "react";
import SummaryCard from "../cards/summary-card.component";
import styles from "./heightandweight-detailed-summary.css";
import dayjs from "dayjs";
import { getDimenionsObservationsRestAPI } from "./heightandweight.resource";
import { useCurrentPatient } from "@openmrs/esm-api";
import { isEmpty } from "lodash-es";
import {
  convertToPounds,
  convertToFeet,
  convertoToInches,
  customDateFormat
} from "./heightandweight-helper";

export function HeightAndWeightDetailedSummary(
  props: HeightAndWeightDetailedSummaryProps
) {
  const [dimensions, setDimensions] = useState<any>({});
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  useEffect(() => {
    getDimenionsObservationsRestAPI(patientUuid).subscribe(response => {
      setDimensions(
        response.find(dimension => dimension.obsData.weight.uuid === props.uuid)
      );
    });
  }, [props.uuid, patientUuid, isLoadingPatient]);

  function displayNoHeightAndWeight() {
    return (
      <SummaryCard name="Height & Weight" styles={{ width: "100%" }}>
        <div className={styles.heightAndWeightDetailedSummary}>
          <p className="omrs-bold">
            The patient's Height and Weight is not documented.
          </p>
          <p className="omrs-bold">
            Please <a href="/">add patient height and weight</a>.
          </p>
        </div>
      </SummaryCard>
    );
  }

  function displayHeightAndWeight() {
    return (
      <div className={styles.heightAndWeightDetailedSummary}>
        <SummaryCard
          name="Height & Weight"
          editBtnUrl={`/patient/dimensions`}
          styles={{ width: "100%" }}
        >
          <div className={styles.heightAndWeightContainer}>
            {!isEmpty(dimensions) && (
              <table className={styles.summaryTable}>
                <tbody>
                  <tr>
                    <td>Measured at </td>
                    <td>
                      {[
                        customDateFormat(
                          dimensions.obsData.weight.encounter.encounterDatetime,
                          "DD-MMM-YYYY"
                        ),
                        customDateFormat(
                          dimensions.obsData.weight.encounter.encounterDatetime,
                          "HH:mm A"
                        )
                      ].join(" ")}
                    </td>
                  </tr>
                  <tr>
                    <td>Weight</td>
                    <td>
                      {dimensions.weight} <span>Kg</span>
                    </td>
                    <td>
                      {convertToPounds(dimensions.weight)} <span>lbs</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Height</td>
                    <td>
                      {dimensions.height} <span>cm</span>
                    </td>
                    <td>
                      {convertToFeet(dimensions.height)} <span>feet</span>{" "}
                      {convertoToInches(dimensions.height)} <span>inches</span>
                    </td>
                  </tr>
                  <tr>
                    <td>BMI</td>
                    <td>
                      {dimensions.bmi} <span>Kg/m2</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </SummaryCard>

        <SummaryCard
          name="Details"
          styles={{
            width: "100%",
            backgroundColor: "var(--omrs-color-bg-medium-contrast)"
          }}
        >
          <div className={`omrs-type-body-regular ${styles.summaryCard}`}>
            <table className={styles.heightAndWeightDetailsTable}>
              <thead>
                <tr>
                  <td>Last updated</td>
                  <td>Last updated by</td>
                  <td>Last updated location</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SummaryCard>
      </div>
    );
  }

  return !isEmpty(dimensions)
    ? displayHeightAndWeight()
    : displayNoHeightAndWeight();
}

type HeightAndWeightDetailedSummaryProps = {
  uuid: any;
};
