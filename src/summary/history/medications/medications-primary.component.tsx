import React from "react";
import { match } from "react-router";
import SummaryCard from "../../cards/summary-card.component";
import { fetchPatientMedications } from "./medications.resource";
import styles from "./medications-primary.css";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../../cards/summary-card-footer.component";
import MedicationsOverview from "./medications-overview.component";

export default function MedicationsPrimary(props: MedicationsPrimary) {
  const [patientMedications, setPatientMedications] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    const subscription = fetchPatientMedications(patientUuid).subscribe(
      Medications => setPatientMedications(Medications),
      createErrorHandler()
    );

    return () => subscription.unsubscribe();
  }, [patientUuid]);

  return (
    <div className={styles.medicationsLevelTwo}>
      <MedicationsOverview props={props.match} />
    </div>
  );
}

type MedicationsPrimary = {
  match: match;
};
