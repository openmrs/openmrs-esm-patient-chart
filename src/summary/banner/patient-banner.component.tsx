import React from "react";
import styles from "./patient-banner.component.css";
import { age } from "../profile/age-helpers";
import dayjs from "dayjs";
import ProfileSection from "../profile/profile-section.component";

export default function PatientBanner(props: PatientBannerProps) {
  const [showDemographics, setShowDemographics] = React.useState(false);

  function getPatientNames() {
    return `${props.patient.name[0].family.toUpperCase()}, 
             ${props.patient.name[0].given[1]}`;
  }

  function getPreferredIdentifier() {
    return (
      props.patient.identifier.find(id => id.use === "usual").value ||
      props.patient.identifier[0].value
    );
  }

  return (
    <>
      {showDemographics ? (
        <div className={styles.profileWrapper}>
          <div className={styles.collapseBtnWrapper}>
            <button
              className={`${styles.collapseBtn} omrs-btn omrs-rounded`}
              onClick={() => setShowDemographics(false)}
            >
              collapse
            </button>
            <svg className="omrs-icon" fill="var(--omrs-color-inactive-grey)">
              <use xlinkHref="#omrs-icon-chevron-down" />
            </svg>
          </div>
          <ProfileSection patient={props.patient} match={props.match} />
        </div>
      ) : (
        <div className={styles.patientBanner}>
          {props.patient && (
            <>
              <div className={styles.demographics}>
                <div className={`${styles.patientName} omrs-type-title-5`}>
                  {getPatientNames()}
                </div>
                <div className={`${styles.otherDemographics}`}>
                  <span
                    className={`${styles.demographic} omrs-type-body-regular`}
                  >
                    {age(props.patient.birthDate)}
                  </span>
                </div>
                <div className={`${styles.otherDemographics}`}>
                  <span
                    className={`${styles.desktopLabel} omrs-type-body-small`}
                  >
                    Born
                  </span>
                  <span
                    className={`${styles.demographic} omrs-type-body-regular`}
                  >
                    {dayjs(props.patient.birthDate).format("DD-MMM-YYYY")}
                  </span>
                </div>
                <div className={`${styles.otherDemographics}`}>
                  <span
                    className={`${styles.desktopLabel} omrs-type-body-small`}
                  >
                    Gender
                  </span>
                  <span
                    className={`${styles.demographic} omrs-type-body-regular`}
                  >
                    {props.patient.gender}
                  </span>
                </div>
                <div className={`${styles.otherDemographics}`}>
                  <span
                    className={`${styles.desktopLabel} omrs-type-body-small`}
                  >
                    Preferred ID
                  </span>
                  <span
                    className={`${styles.demographic} omrs-type-body-regular`}
                  >
                    {getPreferredIdentifier()}
                  </span>
                </div>
              </div>
              <div className={styles.moreBtn}>
                <button
                  className={`${styles.moreBtn} omrs-unstyled`}
                  onClick={() => setShowDemographics(true)}
                >
                  more
                  <svg
                    className="omrs-icon"
                    fill="var(--omrs-color-inactive-grey)"
                  >
                    <use xlinkHref="#omrs-icon-chevron-down" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

type PatientBannerProps = {
  match: any;
  patient: fhir.Patient;
};
