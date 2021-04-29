import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import AllergyForm from "./allergy-form.component";
import styles from "./allergy-record.css";
import { SummaryCard, RecordDetails } from "@openmrs/esm-patient-common-lib";
import { RouteComponentProps } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createErrorHandler } from "@openmrs/esm-framework";
import { Allergy, fetchAllergyByUuid } from "./allergy-intolerance.resource";
import { useAllergiesContext } from "./allergies.context";
import { openWorkspaceTab } from "./openWorkspaceTab";

interface AllergyRecordProps
  extends RouteComponentProps<{ allergyUuid: string }> {}

enum Severity {
  Severe = "Severe",
  Mild = "Mild",
  Moderate = "Moderate",
}

export default function AllergyRecord(props: AllergyRecordProps) {
  const [allergy, setAllergy] = useState<Allergy>(null);
  const { patient } = useAllergiesContext();
  const { t } = useTranslation();
  const { allergyUuid } = props.match.params;

  useEffect(() => {
    if (patient && allergyUuid) {
      const sub = fetchAllergyByUuid(allergyUuid).subscribe(
        (allergy) => setAllergy(allergy),
        createErrorHandler()
      );

      return () => sub.unsubscribe();
    }
  }, [patient, allergyUuid]);

  return (
    <>
      {allergy && Object.entries(allergy).length && (
        <div className={styles.allergyContainer}>
          <SummaryCard
            name={t("Allergy", "Allergy")}
            styles={{ width: "100%" }}
            editComponent={AllergyForm}
            showComponent={() =>
              openWorkspaceTab(
                AllergyForm,
                `${t("Edit Allergy", "Edit Allergy")}`,
                {
                  allergyUuid: allergy.id,
                }
              )
            }
            link="/"
          >
            <div
              className={`omrs-type-body-regular ${styles.allergyCard} ${
                allergy.reactionSeverity === "Severe"
                  ? `${styles.highSeverity}`
                  : `${styles.lowSeverity}`
              }`}
            >
              <div className={`omrs-type-title-3 ${styles.allergyName}`}>
                <span>{allergy.display}</span>
              </div>
              <table className={styles.allergyTable}>
                <thead className="omrs-type-body-regular">
                  <tr>
                    <th>{t("Severity", "Severity")}</th>
                    <th>{t("Reaction", "Reaction")}</th>
                    <th>{t("Onset Date", "Onset Date")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div
                        className={`${styles.centerItems} ${
                          styles.reactionSeverity
                        } ${
                          allergy.reactionSeverity === Severity.Severe
                            ? `omrs-bold`
                            : ``
                        }`}
                      >
                        {allergy.reactionSeverity === Severity.Severe && (
                          <svg
                            className="omrs-icon"
                            fill="var(--omrs-color-danger)"
                          >
                            <use xlinkHref="#omrs-icon-important-notification" />
                          </svg>
                        )}
                        {allergy.reactionSeverity}
                      </div>
                    </td>
                    <td>{allergy.reactionManifestations?.join(", ") || ""}</td>
                    <td>
                      {allergy.recordedDate
                        ? dayjs(allergy.recordedDate).format("MMM-YYYY")
                        : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
              {allergy?.note && (
                <table className={styles.allergyTable}>
                  <thead className="omrs-type-body-regular">
                    <tr>
                      <th>{t("Comments", "Comments")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{allergy.note}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              <div className={styles.allergyFooter}></div>
            </div>
          </SummaryCard>
          <RecordDetails>
            <table className={styles.allergyTable}>
              <thead className="omrs-type-body-regular">
                <tr>
                  <th>{t("Last updated", "Last updated")}</th>
                  <th>{t("Last updated by", "Last updated by")}</th>
                  <th>{t("Last updated location", "Last updated location")}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontFamily: "Work Sans" }}>
                    {allergy.lastUpdated
                      ? dayjs(allergy.lastUpdated).format("DD-MMM-YYYY")
                      : "-"}
                  </td>
                  <td>{allergy.recordedBy}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </RecordDetails>
        </div>
      )}
    </>
  );
}
