import React from "react";
import { match } from "react-router";
import SummaryCard from "../cards/summary-card.component";
import { fetchPatientMedications } from "./medications.resource";
import styles from "./medications.css";
import { formatDate } from "../heightandweight/heightandweight-helper";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../cards/summary-card-footer.component";
import { useTranslation } from "react-i18next";

export default function MedicationsSummary(props: MedicationsOverviewProps) {
  const [patientMedications, setPatientMedications] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  const { t } = useTranslation();

  React.useEffect(() => {
    const subscription = fetchPatientMedications(patientUuid).subscribe(
      Medications => setPatientMedications(Medications),
      createErrorHandler()
    );
    return () => subscription.unsubscribe();
  }, [patientUuid]);

  return (
    <SummaryCard
      name={t("Active Medications", "Active Medications")}
      match={props.match}
      styles={{ width: "100%", maxWidth: "45rem" }}
      link={`/patient/${patientUuid}/chart/medications`}
    >
      <table className={styles.medicationsTable}>
        <tbody>{patientMedications && parseRestWsMeds()}</tbody>
      </table>
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/medications`} />
    </SummaryCard>
  );

  function parseFhirMeds() {
    patientMedications.map((medication, index) => {
      return (
        <React.Fragment key={medication.id}>
          {medication.status === "active" && (
            <tr>
              <td>
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--omrs-color-ink-high-contrast)"
                  }}
                >
                  {medication.medicationReference.display}
                </span>
                {" \u2014 "} {medication.dosageInstruction[0].route.text}{" "}
                {" \u2014 "}
                {medication.dosageInstruction[0].doseQuantity.unit} {" \u2014 "}
                DOSE{" "}
                <span
                  style={{
                    fontWeight: 500,
                    color: "var(--omrs-color-ink-high-contrast)"
                  }}
                >
                  {medication.dosageInstruction[0].doseQuantity.value}{" "}
                  {medication.dosageInstruction[0].doseQuantity.unit}{" "}
                  {medication.dosageInstruction[0].timing.code.text}
                </span>
              </td>
              <td style={{ textAlign: "end" }}>
                <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                  <use xlinkHref="#omrs-icon-chevron-right" />
                </svg>
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    });
  }

  function parseRestWsMeds() {
    return patientMedications.map((medication, index) => {
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
              {" \u2014 "}{" "}
              <span className={styles.medicationStatement}>
                {medication.doseUnits.display}
              </span>{" "}
              {" \u2014 "}
              <span className={styles.medicationStatement}>
                {medication.route.display}{" "}
              </span>
              {" \u2014 "}
              DOSE{" "}
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--omrs-color-ink-high-contrast)"
                }}
                className={styles.medicationStatement}
              >
                {getDosage(medication.drug.strength, medication.dose)}{" "}
                {medication.frequency.display}
              </span>
            </td>
            <td style={{ textAlign: "end" }}>
              <svg className="omrs-icon" fill="rgba(0, 0, 0, 0.54)">
                <use xlinkHref="#omrs-icon-chevron-right" />
              </svg>
            </td>
          </tr>
        </React.Fragment>
      );
    });
  }
}

function getDosage(strength, doseNumber) {
  const i = strength.search(/\D/);
  const strengthQuantity = strength.substring(0, i);

  const concentrationStartIndex = strength.search(/\//);

  let strengthUnits = strength.substring(i);
  let dosage;

  if (concentrationStartIndex >= 0) {
    strengthUnits = strength.substring(i, concentrationStartIndex);
    const j = strength.substring(concentrationStartIndex + 1).search(/\D/);
    const concentrationQuantity = strength.substr(
      concentrationStartIndex + 1,
      j
    );
    const concentrationUnits = strength.substring(
      concentrationStartIndex + 1 + j
    );
    dosage =
      doseNumber +
      strengthUnits +
      " (" +
      (doseNumber / strengthQuantity) * concentrationQuantity +
      concentrationUnits +
      ")";
  } else {
    dosage = strengthQuantity * doseNumber + strengthUnits;
  }
  return dosage;
}

type MedicationsOverviewProps = {
  match: match;
};
