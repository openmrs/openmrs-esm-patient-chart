import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import ImmunizationsForm from "./immunizations-form.component";
import styles from "./immunizations-detailed-summary.css";
import vaccinationRowStyles from "./vaccination-row.css";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { openWorkspaceTab } from "@openmrs/esm-patient-common-lib";
import { ImmunizationData } from "./immunization-domain";

export default function VaccinationRow(params: ImmunizationProps) {
  const [patientImmunization, setPatientImmunization] = useState(null);
  const [toggleOpen, setToggleOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setPatientImmunization(params.immunization);
  }, [params]);

  function getRecentVaccinationText(patientImmunization: ImmunizationData) {
    if (!hasExistingDoses(patientImmunization)) {
      return "";
    }

    let recentDose = patientImmunization.existingDoses[0];
    const vaccinationDate = dayjs(recentDose.occurrenceDateTime).format(
      "DD-MMM-YYYY"
    );
    if (hasSequence(patientImmunization)) {
      const doseName = recentDose.sequenceLabel;
      return (
        <Trans
          i18nKey="recentDoseWithSequenceFormat"
          values={{ doseName: doseName, vaccinationDate: vaccinationDate }}
        >
          {doseName} on {vaccinationDate}
        </Trans>
      );
    }
    return (
      <Trans
        i18nKey="recentDoseWithoutSequenceFormat"
        values={{ vaccinationDate: vaccinationDate }}
      >
        Single Dose on {vaccinationDate}
      </Trans>
    );
  }

  function renderSequenceTable(patientImmunization: ImmunizationData) {
    return patientImmunization?.existingDoses?.map((dose, i) => {
      return (
        <tr key={`${patientImmunization.vaccineUuid}-${i}`}>
          {hasSequence(patientImmunization) && <td>{dose.sequenceLabel}</td>}
          {hasSequence(patientImmunization) || (
            <td>{t("singleDose", "Single Dose")}</td>
          )}
          <td>
            <div className={`${styles.alignRight}`}>
              {dayjs(dose.occurrenceDateTime).format("DD-MMM-YYYY")}
            </div>
          </td>
          <td>
            <div className={`${styles.alignRight}`}>
              {dayjs(dose.expirationDate).format("DD-MMM-YYYY")}
            </div>
          </td>
          <td>
            {
              <Link to={`/${dose.immunizationObsUuid}`}>
                <svg
                  className="omrs-icon"
                  fill="var(--omrs-color-ink-low-contrast)"
                  onClick={() => {
                    const formHeader = t(
                      "immunizationForm",
                      "Immunization Form"
                    );
                    return openWorkspaceTab(ImmunizationsForm, formHeader, {
                      vaccineName: patientImmunization?.vaccineName,
                      vaccineUuid: patientImmunization?.vaccineUuid,
                      immunizationObsUuid: dose?.immunizationObsUuid,
                      manufacturer: dose.manufacturer,
                      lotNumber: dose.lotNumber,
                      expirationDate: dose.expirationDate,
                      sequences: patientImmunization.sequences,
                      currentDose: {
                        sequenceLabel: dose.sequenceLabel,
                        sequenceNumber: dose.sequenceNumber,
                      },
                      vaccinationDate: dose.occurrenceDateTime,
                    });
                  }}
                >
                  <use xlinkHref="#omrs-icon-chevron-right" />
                </svg>
              </Link>
            }
          </td>
        </tr>
      );
    });
  }

  return (
    patientImmunization && (
      <React.Fragment key={patientImmunization?.uuid}>
        <tr className={styles.immunizationRow}>
          <td className="omrs-medium">
            <div className={styles.expandSequence}>
              <svg
                className={`omrs-icon ${
                  hasExistingDoses(patientImmunization) && styles.expandButton
                }`}
                fill="var(--omrs-color-ink-low-contrast)"
                onClick={() => {
                  hasExistingDoses(patientImmunization) &&
                    setToggleOpen(!toggleOpen);
                }}
              >
                <use
                  xlinkHref={
                    hasExistingDoses(patientImmunization)
                      ? toggleOpen
                        ? "#omrs-icon-chevron-up"
                        : "#omrs-icon-chevron-down"
                      : ""
                  }
                />
              </svg>
            </div>
            <span>{patientImmunization.vaccineName}</span>
          </td>
          <td>
            <div className={`${styles.alignRight}`}>
              {getRecentVaccinationText(patientImmunization)}
            </div>
          </td>
          <td>
            <div className={styles.headerAdd}>
              <button
                className={`${styles.addButton}`}
                onClick={() => {
                  const formHeader = t("immunizationForm", "Immunization Form");
                  return openWorkspaceTab(ImmunizationsForm, formHeader, {
                    vaccineName: patientImmunization?.vaccineName,
                    vaccineUuid: patientImmunization?.vaccineUuid,
                    sequences: patientImmunization?.sequences,
                  });
                }}
              >
                +
              </button>{" "}
            </div>
          </td>
        </tr>
        {toggleOpen && (
          <tr
            id={patientImmunization?.uuid}
            className={`immunizationSequenceRow ${vaccinationRowStyles.sequenceRow}`}
          >
            <td colSpan={4}>
              <table
                className={`omrs-type-body-regular immunizationSequenceTable ${vaccinationRowStyles.sequenceTable}`}
              >
                <thead>
                  <tr>
                    <td>{t("sequence", "Sequence")}</td>
                    <td>{t("vaccinationDate", "Vaccination Date")}</td>
                    <td>{t("expirationDate", "Expiration Date")}</td>
                    <td />
                  </tr>
                </thead>
                <tbody>{renderSequenceTable(patientImmunization)}</tbody>
              </table>
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  );
}

function hasExistingDoses(patientImmunization: ImmunizationData) {
  return (
    patientImmunization.existingDoses &&
    patientImmunization.existingDoses.length > 0
  );
}

function hasSequence(patientImmunization: ImmunizationData) {
  return (
    patientImmunization?.sequences && patientImmunization?.sequences?.length > 0
  );
}

type ImmunizationProps = { immunization: any };
