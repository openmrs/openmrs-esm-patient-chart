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

export default function medicationLevelTwo(props: MedicationsOverviewProps) {
  const [patientMedications, setPatientMedications] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();
  const pastMedication = false;

  const { t } = useTranslation();

  React.useEffect(() => {
    const subscription = fetchPatientMedications(patientUuid).subscribe(
      Medications => setPatientMedications(Medications),
      createErrorHandler()
    );
    return () => subscription.unsubscribe();
  }, [patientUuid]);

  function displayMedication() {
    return (
      <React.Fragment>
        <SummaryCard
          name={t("Medications - Current", "Medications - Current")}
          match={props.match}
          styles={{ width: "100%", maxWidth: "45rem" }}
          addBtnUrl={`/patient/${patientUuid}/chart/medicationsleveltwo`}
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
            <tbody>{patientMedications}</tbody>
          </table>
          <SummaryCardFooter
            linkTo={`/patient/${patientUuid}/chart/medicationsleveltwo`}
          />
        </SummaryCard>
        <SummaryCard
          name={t("Medications - Previous", "Medications - Previous")}
          match={props.match}
          styles={{ width: "100%", maxWidth: "45rem" }}
          addBtnUrl={`/patient/${patientUuid}/chart/medicationsleveltwo`}
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
            <tbody>{patientMedications}</tbody>
          </table>
          <SummaryCardFooter
            linkTo={`/patient/${patientUuid}/chart/medicationsleveltwo`}
          />
        </SummaryCard>
      </React.Fragment>
    );
  }

  return displayMedication();
}

type MedicationsOverviewProps = {
  match: match;
};
