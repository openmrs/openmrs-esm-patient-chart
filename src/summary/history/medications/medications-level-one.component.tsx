import React from "react";
import { match } from "react-router";
import SummaryCard from "../../cards/summary-card.component";
import { performPatientMedicationsSearch } from "./medications.resource";
import styles from "./medications.css";
import { formatDate } from "../../documentation/dimension-helpers";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { useCurrentPatient } from "@openmrs/esm-api";
import SummaryCardFooter from "../../cards/summary-card-footer.component";

export default function MedicationsLevelOne(props: MedicationsLevelOneProps) {
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
    <SummaryCard
      name="Medications"
      match={props.match}
      styles={{ flex: 1, margin: ".5rem", width: "45rem", maxWidth: "46rem" }}
    >
      <table className={styles.medicationsTable}>
        <tbody>
          {patientMedications &&
            patientMedications.map((medication, index) => {
              return (
                <React.Fragment key={medication.id}>
                  {medication.status === "active" && (
                    <tr>
                      <td>
                        <span className="omrs-bold">
                          {medication.medicationReference.display}
                        </span>{" "}
                        - {medication.dosageInstruction[0].route.text} -{" "}
                        {medication.dosageInstruction[0].doseQuantity.unit} -
                        DOSE{" "}
                        {medication.dosageInstruction[0].doseQuantity.value}{" "}
                        {medication.dosageInstruction[0].doseQuantity.unit}{" "}
                        {medication.dosageInstruction[0].timing.code.text}
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
            })}
        </tbody>
      </table>
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/Medications`} />
    </SummaryCard>
  );
}

type MedicationsLevelOneProps = {
  match: match;
};
