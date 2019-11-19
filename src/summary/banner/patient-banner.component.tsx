import React from "react";
import styles from "./patient-banner.component.css";
import { age } from "../profile/age-helpers";
import dayjs from "dayjs";
import ProfileSection from "../profile/profile-section.component";

export default function PatientBanner(props: PatientBannerProps) {
  const [showingDemographics, setShowDemographics] = React.useState(false);

  return (
    <aside className={styles.patientBanner}>
      {props.patient && (
        <div className={styles.patientBanner}>
          <div className={styles.demographics}>
            <div className={`${styles.patientName} omrs-type-title-5`}>
              {getPatientNames()}
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {age(props.patient.birthDate)}
              </span>
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.desktopLabel} omrs-type-body-small`}>
                Born
              </span>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {dayjs(props.patient.birthDate).format("DD-MMM-YYYY")}
              </span>
            </div>
            <div className={`${styles.otherDemographics}`}>
              <span className={`${styles.desktopLabel} omrs-type-body-small`}>
                Gender
              </span>
              <span className={`${styles.demographic} omrs-type-body-regular`}>
                {props.patient.gender}
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
          <ProfileSection patient={props.patient} match={props.match} />
        </div>
      )}
    </aside>
  );

  function getPatientNames() {
    return `${props.patient.name[0].family.toUpperCase()}, ${props.patient.name[0].given.join(
      " "
    )}`;
  }

  function toggleDemographics() {
    setShowDemographics(!showingDemographics);
    props.showPatientSummary(showingDemographics);
  }

  function getPreferredIdentifier() {
    return (
      props.patient.identifier.find(id => id.use === "usual").value ||
      props.patient.identifier[0].value
    );
  }
}

type PatientBannerProps = {
  match: any;
  patient: fhir.Patient;
  showPatientSummary: Function;
};
