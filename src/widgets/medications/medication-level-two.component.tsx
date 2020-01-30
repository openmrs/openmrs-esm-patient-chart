import React from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import { fetchPatientMedications } from "./medications.resource";
import styles from "./medication-level-two.css";
import { formatDate } from "../heightandweight/heightandweight-helper";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { getDosage } from "./medication-orders-utils";

export default function MedicationLevelTwo(props: MedicationsOverviewProps) {
  const [patientMedications, setPatientMedications] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  let pastMedication = false;
  let currentMedication = false;

  const { t } = useTranslation();

  React.useEffect(() => {
    const subscription = fetchPatientMedications(patientUuid).subscribe(
      Medications => setPatientMedications(Medications),
      createErrorHandler()
    );
    return () => subscription.unsubscribe();
  }, [patientUuid]);

  function displayCurrentMedications() {
    return (
      <React.Fragment>
        <SummaryCard
          name={t("Medications - current", "Medications - current")}
          match={props.match}
          styles={{ width: "90%" }}
          addBtnUrl={`/patient/${patientUuid}/chart/add`}
        >
          <table className={styles.medicationsTable}>
            <thead>
              <tr>
                <td>Name</td>
                <td>
                  <div className={styles.centerItems}>Status</div>
                </td>
                <td>Start Date</td>
              </tr>
            </thead>
            <tbody>
              {patientMedications &&
                patientMedications
                  .filter(med => med.action === "NEW")
                  .map(medication => {
                    return (
                      <React.Fragment key={medication.uuid}>
                        <tr>
                          <td>
                            <span
                              style={{
                                fontWeight: 500,
                                color: "var(--omrs-color-ink-high-contrast)"
                              }}
                            >
                              {medication.drug.name}
                            </span>
                            {" \u2014 "} {medication.doseUnits.display}{" "}
                            {" \u2014 "}
                            {medication.route.display} {" \u2014 "}
                            DOSE{" "}
                            <span
                              style={{
                                fontWeight: 500,
                                color: "var(--omrs-color-ink-high-contrast)"
                              }}
                            >
                              {getDosage(
                                medication.drug.strength,
                                medication.dose
                              )}{" "}
                              {medication.frequency.display}
                            </span>
                          </td>
                          <td>{medication.action}</td>
                          <td>
                            {dayjs(medication.dateActivated).format(
                              "DD-MMM-YYYY"
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
            </tbody>
          </table>
          <div className={styles.medicationFooter}>
            <p
              style={{ color: "var(--omrs-color-ink-medium-contrast)" }}
              className={"omrs-type-body-large"}
            >
              No more medications available.
            </p>
          </div>
        </SummaryCard>
      </React.Fragment>
    );
  }

  function displayPastMedications() {
    return (
      <React.Fragment>
        <SummaryCard
          name={t("Medications - past", "Medications - past")}
          match={props.match}
          styles={{ width: "90%" }}
          addBtnUrl={`/patient/${patientUuid}/chart/add`}
        >
          <table className={styles.medicationsTable}>
            <thead>
              <tr>
                <td>Name</td>
                <td>
                  <div className={styles.centerItems}>Status</div>
                </td>
                <td>Start Date</td>
              </tr>
            </thead>
            <tbody>
              {patientMedications &&
                patientMedications
                  .filter(med => med.action !== "NEW")
                  .map(medication => {
                    return (
                      <React.Fragment key={medication.uuid}>
                        <tr>
                          <td>
                            <span
                              style={{
                                fontWeight: 500,
                                color: "var(--omrs-color-ink-high-contrast)"
                              }}
                            >
                              {medication.drug.display}
                            </span>
                            {" \u2014 "} {medication.doseUnits.display}{" "}
                            {" \u2014 "}
                            {medication.route.display} {" \u2014 "}
                            DOSE{" "}
                            <span
                              style={{
                                fontWeight: 500,
                                color: "var(--omrs-color-ink-high-contrast)"
                              }}
                            >
                              {getDosage(
                                medication.drug.strength,
                                medication.dose
                              )}{" "}
                              {medication.frequency.display}
                            </span>
                          </td>
                          <td>{medication.action}</td>
                          <td>
                            {dayjs(medication.dateActivated).format(
                              "DD-MMM-YYYY"
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
            </tbody>
          </table>
          <div className={styles.medicationFooter}>
            <p
              style={{ color: "var(--omrs-color-ink-medium-contrast)" }}
              className={"omrs-type-body-large"}
            >
              No more medications available.
            </p>
          </div>
        </SummaryCard>
      </React.Fragment>
    );
  }
  function displayNoMedicationHistory() {
    return (
      <SummaryCard
        name="Medication"
        match={props.match}
        styles={{ width: "90%" }}
      >
        <div className={styles.medicationMargin}>
          <p className="omrs-bold">
            The patient's medication history is not documented.
          </p>
          <p className="omrs-bold">
            Please <a href="/">add medication history</a>.
          </p>
        </div>
      </SummaryCard>
    );
  }

  function displayMedications() {
    return (
      <>
        <div>{displayCurrentMedications()}</div>
        <div>{displayPastMedications()}</div>
      </>
    );
  }

  return (
    <>
      {patientMedications && patientMedications.length > 0
        ? displayMedications()
        : displayNoMedicationHistory()}
    </>
  );
}

type MedicationsOverviewProps = {
  match: match;
};
