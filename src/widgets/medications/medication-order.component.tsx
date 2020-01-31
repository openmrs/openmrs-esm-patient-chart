import React, { useState, useEffect } from "react";
import { match } from "react-router";
import styles from "./medication-order.css";
import SummaryCard from "../cards/summary-card.component";
import commonMedicationJson from "./common-medication.json";
import {
  getDrugByName,
  getPatientEncounterID,
  getPatientDrugOrderDetails,
  getDurationUnits
} from "./medications.resource";
import dayjs from "dayjs";
import { useCurrentPatient } from "@openmrs/esm-api";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { setDefaultValues } from "./medication-orders-utils";

const CARE_SETTINGS: string = "6f0c9a92-6f24-11e3-af88-005056821db0";
const ORDERER: string = "e89cae4a-3cb3-40a2-b964-8b20dda2c985";

export function MedicationOrder(props: MedicationOrderProps) {
  const [commonMedication, setCommonMedication] = useState([]);
  const [drugUuid, setDrugUuid] = useState("");
  const [drugName, setDrugName] = useState("");
  const [encounterUuid, setEncounterUuid] = useState("");
  const [dose, setDose] = useState();
  const [doseUnits, setDoseUnits] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [frequencyUuid, setFrequencyUuid] = useState("");
  const [frequencyName, setFrequencyName] = useState("");
  const [routeUuid, setRouteUuid] = useState(
    "160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  );
  const [routeName, setRouteName] = useState();
  const [asNeeded, setAsNeeded] = useState(false);
  const [numRefills, setNumRefills] = useState(0);
  const [action, setAction] = useState("NEW");
  const [quantity, setQuantity] = useState();
  const [duration, setDuration] = React.useState(0);
  const [durationUnit, setDurationUnit] = React.useState(
    "1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
  );
  const [durationUnitsArray, setDurationUnitArray] = useState([]);
  const [dosingInstructions, setDosingInstructions] = useState();
  const [drugStrength, setDrugStrength] = useState();
  const [startDate, setStartDate] = React.useState(
    dayjs(new Date()).format("DD-MMM-YYYY")
  );
  const [endDate, setEndDate] = React.useState(
    dayjs(new Date()).format("DD-MMM-YYYY")
  );
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const [previousOrder, setPreviousOrder] = useState();

  useEffect(() => {
    const abortcontroller = new AbortController();
    if (patientUuid) {
      getDrugByName(props.drugName, abortcontroller).then(response => {
        setCommonMedication(getDrugMedication(response.data.results[0].uuid));
        setDrugName(response.data.results[0].name);
        setDrugUuid(response.data.results[0].uuid);
        setDoseUnits(response.data.results[0].dosageForm.uuid);
        setDosageForm(response.data.results[0].dosageForm.display);
        setDrugStrength(response.data.results[0].strength);
      }, createErrorHandler);

      getPatientEncounterID(patientUuid, abortcontroller).then(
        response => setEncounterUuid(response.data.results[0].uuid),
        createErrorHandler()
      );
      getDurationUnits(abortcontroller).then(response => {
        setDurationUnitArray(response.data.answers);
      }, createErrorHandler());
    }
    return () => abortcontroller.abort();
  }, [props.drugName, patientUuid]);

  useEffect(() => {
    if (startDate.length > 0 && durationUnitsArray) {
      let durationPeriod = durationUnitsArray.filter(duration => {
        return duration.uuid === durationUnit;
      });
      if (durationPeriod.length > 0) {
        let durationName: any = durationPeriod[0].display.substring(
          0,
          durationPeriod[0].display.lastIndexOf("s")
        );
        setEndDate(
          dayjs(startDate)
            .add(duration, durationName)
            .format("DD-MMM-YYYY")
        );
      } else {
        setEndDate(
          dayjs(startDate)
            .add(duration, "day")
            .format("DD-MMM-YYYY")
        );
      }
    }
  }, [startDate, durationUnit, durationUnitsArray, duration]);

  useEffect(() => {
    let defaults: any;
    if (commonMedication.length > 0 && props.editProperty.length === 0) {
      defaults = setDefaultValues(commonMedication);
      setDoseUnits(defaults[0].drugUnits);
      setFrequencyUuid(defaults[0].frequencyConcept);
      setDose(defaults[0].dose);
      setRouteUuid(defaults[0].routeConcept);
      setRouteName(defaults[0].routeName);
    }
    if (props.editProperty.length > 0) {
    }
  }, [commonMedication, props.editProperty.length]);

  //Edit default values

  useEffect(() => {
    const ac = new AbortController();
    if (props.editProperty.length > 0) {
      getPatientDrugOrderDetails(ac, props.editProperty[0].OrderUuid).then(
        response => {
          setEncounterUuid(response.data.encounter.uuid);
          setStartDate(
            dayjs(response.data.dateActivated).format("DD-MMM-YYYY")
          );
          setDosingInstructions(response.data.dosingInstructions);
          setDoseUnits(response.data.doseUnits.uuid);
          setDosageForm(response.data.doseUnits.display);
          setRouteUuid(response.data.route.uuid);
          setRouteName(response.data.route.display);
          setDose(response.data.dose);
          setDuration(response.data.duration);
          setFrequencyName(response.data.frequency.display);
          setFrequencyUuid(response.data.frequency.concept.uuid);
          setAction("REVISE");
          setNumRefills(response.data.numRefills);
          if (response.data.previousOrder === null) {
            setPreviousOrder(response.data.uuid);
          } else {
            setPreviousOrder(response.data.previousOrder.uuid);
          }
        }
      );
      return () => ac.abort();
    }
  }, [props.editProperty]);

  useEffect(() => {
    if (
      frequencyUuid &&
      commonMedication.length > 0 &&
      props.editProperty.length === 0
    ) {
      setFrequencyName(
        commonMedication[0].commonFrequencies.find(
          el => el.conceptUuid === frequencyUuid
        ).name
      );
    }
  }, [commonMedication, frequencyUuid, props.editProperty.length]);

  const getDrugMedication = drugUuid => {
    return commonMedicationJson.filter(
      medication => medication.uuid === drugUuid
    );
  };

  const handleIncreaseRefillClick = event => {
    setNumRefills(numRefills + 1);
  };

  const handleDecreaseRefillClick = event => {
    if (numRefills > 0) {
      setNumRefills(numRefills - 1);
    }
  };

  const handleSubmit = $event => {
    props.resetParams();
    $event.preventDefault();
    if (action === "NEW") {
      props.setOrderBasket([
        ...props.orderBasket,
        {
          patientUuid: patientUuid,
          careSetting: CARE_SETTINGS,
          orderer: ORDERER,
          encounterUuid: encounterUuid,
          drugUuid: drugUuid,
          dose: dose,
          doseUnitsConcept: doseUnits,
          route: routeUuid,
          frequencyUuid: frequencyUuid,
          asNeeded: asNeeded,
          numRefills: numRefills,
          action: "NEW",
          quantity: 1,
          quantityUnits: "162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          type: "drugorder",
          drugName: drugName,
          duration: duration,
          durationUnits: durationUnit,
          routeName: routeName,
          dosageForm: dosageForm,
          frequencyName: frequencyName,
          drugStrength: drugStrength,
          dosingInstructions: dosingInstructions,
          dateStopped: endDate
        }
      ]);
    } else {
      props.setOrderBasket([
        ...props.orderBasket,
        {
          patientUuid: patientUuid,
          careSetting: CARE_SETTINGS,
          orderer: ORDERER,
          encounterUuid: encounterUuid,
          drugUuid: drugUuid,
          dose: dose,
          doseUnitsConcept: doseUnits,
          route: routeUuid,
          frequencyUuid: frequencyUuid,
          asNeeded: asNeeded,
          numRefills: numRefills,
          action: "REVISE",
          quantity: 1,
          quantityUnits: "162396AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          type: "drugorder",
          drugName: drugName,
          previousOrder: previousOrder,
          duration: duration,
          durationUnits: durationUnit,
          routeName: routeName,
          dosageForm: dosageForm,
          frequencyName: frequencyName,
          drugStrength: drugStrength,
          dosingInstructions: dosingInstructions
        }
      ]);
    }
    props.hideModal();
  };

  const handleDuractionChange = $event => {
    setDuration(Number($event));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.medicationOrderWrapper}>
      <SummaryCard
        name="Order Medication"
        match={props.match}
        styles={{ width: "100%" }}
      >
        <div className={styles.medicationHeaderSummary}>
          <table>
            <tbody>
              <tr>
                <td>{drugName} &#x2013; </td>
                <td>{routeName} &#x2013; </td>
                <td>{dosageForm} &#x2013;</td>
                <td>
                  DOSE <span>{`${dose} ${dosageForm}`}</span> &#x2013;
                </td>
                <td>{frequencyName}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </SummaryCard>
      <div className={styles.medicationOrderDetailsContainer}>
        <div
          className={styles.medicationContainer}
          style={{ marginRight: "0.625rem" }}
        >
          <div className={styles.doseAndFrequency}>
            <div className={styles.medicationOrderRadio}>
              <span>Dose</span>
            </div>
            {commonMedication.length > 0 &&
              dose &&
              commonMedication[0].commonDosages.map(dosage => {
                return (
                  <div
                    className={styles.medicationOrderRadio}
                    key={dosage.dosage}
                  >
                    <input
                      type="radio"
                      name="doseUnits"
                      id={dosage.dosage}
                      defaultValue={dosage.numberOfPills}
                      defaultChecked={dose === dosage.numberOfPills}
                      onChange={$event => {
                        setDose($event.target.value);
                      }}
                    />
                    <label htmlFor={dosage.dosage}>{dosage.dosage}</label>
                  </div>
                );
              })}
            <div className={styles.medicationOrderRadio}>
              <input type="radio" name="doseUnits" id="doseUnits1" />
              <label htmlFor="doseUnits1">other</label>
            </div>
          </div>
          <div className={styles.doseAndFrequency}>
            <div className={styles.medicationOrderRadio}>
              <span>Frequency</span>
            </div>
            {commonMedication.length > 0 &&
              frequencyUuid &&
              commonMedication[0].commonFrequencies.map(frequency => {
                return (
                  <div
                    className={styles.medicationOrderRadio}
                    key={frequency.conceptUuid}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      id={frequency.name}
                      defaultValue={frequency.conceptUuid}
                      defaultChecked={frequency.conceptUuid === frequencyUuid}
                      onChange={$event => setFrequencyUuid($event.target.value)}
                    />
                    <label htmlFor={frequency.name}>{frequency.name}</label>
                  </div>
                );
              })}
            <div className={styles.medicationOrderRadio}>
              <input type="radio" name="frequency" id="otherFrequency" />
              <label htmlFor="otherFrequency">other</label>
            </div>
          </div>
        </div>
        <div className={styles.medicationContainerColumnTwo}>
          <div
            className={styles.medicationContainer}
            style={{
              width: "100%",
              marginBottom: "0.625rem",
              flexDirection: "column"
            }}
          >
            <div className={styles.medicationOrderInput}>
              <label htmlFor="startDate">Start date</label>
              <input
                type="text"
                name="startDate"
                id="startDate"
                placeholder="Day-Month-Year"
                autoComplete="off"
                required
                defaultValue={startDate}
              />
            </div>
            <div
              className={styles.medicationOrderInput}
              style={{ flexDirection: "row", margin: "0.625rem 0rem" }}
            >
              <div style={{ flex: 1 }} className={styles.omrsSelectOptions}>
                <label htmlFor="duration">Duration</label>
                <label htmlFor="option">
                  <select
                    id="option"
                    onChange={$event => setDurationUnit($event.target.value)}
                    defaultChecked={true}
                    value={durationUnit}
                  >
                    {durationUnitsArray &&
                      durationUnitsArray.map(durationUnit => {
                        return (
                          <option
                            key={durationUnit.uuid}
                            value={durationUnit.uuid}
                          >
                            {durationUnit.display}
                          </option>
                        );
                      })}
                  </select>
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <div className="omrs-increment-buttons">
                  <div>
                    <button
                      type="button"
                      className="omrs-btn-icon-medium"
                      onClick={$event => setDuration(duration + 1)}
                    >
                      <svg>
                        <use xlinkHref="#omrs-icon-add"></use>
                      </svg>
                    </button>
                  </div>
                  <div>
                    <input
                      type="number"
                      value={duration}
                      onChange={$event =>
                        handleDuractionChange($event.target.value)
                      }
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="omrs-btn-icon-medium"
                      onClick={$event => {
                        if (duration > 0) {
                          setDuration(duration - 1);
                        }
                      }}
                    >
                      <svg>
                        <use xlinkHref="#omrs-icon-remove"></use>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div></div>
            </div>
            <div className={styles.medicationOrderInput}>
              <label htmlFor="endDate">End date</label>
              <input
                type="text"
                name="endDate"
                id="endDate"
                placeholder="Day-Month-Year"
                required
                autoComplete="off"
                value={endDate}
                onChange={$event => setEndDate($event.target.value)}
              />
            </div>

            <div
              className={styles.medicationOrderInput}
              style={{
                margin: "1.25rem 0rem 1.0625rem 0rem",
                border: "0.0625rem solid var(--omrs-color-bg-low-contrast)"
              }}
            ></div>
            <div
              className={styles.medicationOrderInput}
              style={{ width: "40%" }}
            >
              <label htmlFor="refills">Refills</label>
              <div id="refills" className="omrs-increment-buttons">
                <div>
                  <svg
                    className="omrs-icon"
                    onClick={handleIncreaseRefillClick}
                  >
                    <use xlinkHref="#omrs-icon-add"></use>
                  </svg>
                </div>
                <div>
                  <span>{numRefills}</span>
                </div>
                <div>
                  <svg
                    className="omrs-icon"
                    onClick={handleDecreaseRefillClick}
                  >
                    <use xlinkHref="#omrs-icon-remove"></use>
                  </svg>
                </div>
              </div>
              <label htmlFor="lastDateOfRefill">Last date with refills</label>
            </div>
          </div>

          <div className={styles.medicationContainer} style={{ width: "100%" }}>
            <div className={styles.medicationOrderInput}>
              <label htmlFor="dosingInstructions">Dosing instructions</label>
              <textarea
                name="dosingInstruction"
                id="dosingInstructionTextArea"
                rows={6}
                defaultValue={dosingInstructions}
                onChange={$event => setDosingInstructions($event.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.medicationOrderFooter}>
        <button className="omrs-btn omrs-outlined-neutral">Cancel</button>
        <button className="omrs-btn omrs-filled-action" disabled={false}>
          Save
        </button>
      </div>
    </form>
  );
}

type MedicationOrderProps = {
  match: match;
  drugName: string;
  orderBasket?: any[];
  setOrderBasket?: any;
  hideModal?: any;
  action?: any;
  orderUuid?: any;
  editProperty?: any[];
  resetParams?: any;
};
