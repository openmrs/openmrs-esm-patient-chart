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
      name="Active Medications"
      match={props.match}
      styles={{ width: "100%", maxWidth: "45rem" }}
      link={`/patient/${patientUuid}/chart/medications`}
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
                        <span
                          style={{
                            fontWeight: 500,
                            color: "var(--omrs-color-ink-high-contrast)"
                          }}
                        >
                          {medication.medicationReference.display}
                        </span>
                        {" \u2014 "}{" "}
                        {medication.dosageInstruction[0].route.text}{" "}
                        {" \u2014 "}
                        {medication.dosageInstruction[0].doseQuantity.unit}{" "}
                        {" \u2014 "}
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
            })}
        </tbody>
      </table>
      <SummaryCardFooter linkTo={`/patient/${patientUuid}/chart/medications`} />
    </SummaryCard>
  );
}

type MedicationsLevelOneProps = {
  match: match;
};
