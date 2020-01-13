import React from "react";
import styles from "./patient-banner.component.css";
import { age } from "../widgets/profile/age-helpers";
import dayjs from "dayjs";
import ProfileSection from "../widgets/profile/profile-section.component";
import { useCurrentPatient } from "@openmrs/esm-api";

export default function PatientBanner(props: PatientBannerProps) {
  const [showingDemographics, setShowDemographics] = React.useState(false);
  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  return (
    <aside className={styles.patientBanner}>
      {!isLoadingPatient && !patientErr && (
        <div
          className={styles.patientBanner}
          role="button"
          onClick={toggleDemographics}
          tabIndex={0}
        >
          <div className={styles.demographics}>
            <div className={`${styles.patientName} omrs-type-title-5`}>
              {getPatientNames()}
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {age(patient.birthDate)}
              </span>
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.desktopLabel} omrs-type-body-small`}>
                Born
              </span>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {dayjs(patient.birthDate).format("DD-MMM-YYYY")}
              </span>
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.desktopLabel} omrs-type-body-small`}>
                Gender
              </span>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {patient.gender}
              </span>
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.desktopLabel} omrs-type-body-small`}>
                Preferred ID
              </span>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {getPreferredIdentifier()}
              </span>
            </div>
          </div>
          <div className={styles.moreBtn}>
            <button
              className={`${styles.moreBtn} omrs-unstyled`}
              onClick={toggleDemographics}
            >
              {showingDemographics ? "Close" : "Open"}
            </button>
            <svg
              className={`omrs-icon`}
              fill="var(--omrs-color-ink-medium-contrast)"
            >
              <use
                xlinkHref={
                  showingDemographics
                    ? "#omrs-icon-chevron-up"
                    : "#omrs-icon-chevron-down"
                }
              />
            </svg>
          </div>
        </div>
      )}
      {showingDemographics && (
        <div className={styles.patientProfile}>
          <ProfileSection patient={patient} match={props.match} />
        </div>
      )}
    </aside>
  );

  function getPatientNames() {
    return `${patient.name[0].family.toUpperCase()}, ${patient.name[0].given.join(
      " "
    )}`;
  }

  function toggleDemographics() {
    setShowDemographics(!showingDemographics);
  }

  function getPreferredIdentifier() {
    return (
      patient.identifier.find(id => id.use === "usual").value ||
      patient.identifier[0].value
    );
  }
}

type PatientBannerProps = {
  match: any;
};
