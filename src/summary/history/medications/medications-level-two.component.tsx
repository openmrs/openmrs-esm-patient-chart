import React from "react";
import { match } from "react-router";
import SummaryCard from "../../cards/summary-card.component";
import { performPatientMedicationsSearch } from "./medications.resource";
import styles from "./medications-card-level-two.css";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../../cards/summary-card-footer.component";
import MedicationsLevelOne from "./medications-level-one.component";

export default function MedicationsLevelTwo(props: MedicationsLevelTwoProps) {
  const [patientMedications, setPatientMedications] = React.useState(null);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  React.useEffect(() => {
    const subscription = performPatientMedicationsSearch(patientUuid).subscribe(
      Medications => setPatientMedications(Medications),
      createErrorHandler()
    );

    return () => subscription.unsubscribe();
  }, [patientUuid]);

  return (
    <div className={styles.medicationsLevelTwo}>
      <MedicationsLevelOne props={props.match} />
    </div>
  );
}

type MedicationsLevelTwoProps = {
  match: match;
};
