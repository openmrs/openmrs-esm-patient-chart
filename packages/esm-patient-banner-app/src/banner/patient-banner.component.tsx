import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  PatientBannerActionsMenu,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
  displayName,
} from '@openmrs/esm-framework';
import styles from './patient-banner.scss';

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow }) => {
  const patientBannerRef = useRef(null);
  const [isTabletViewport, setIsTabletViewport] = useState(false);

  useEffect(() => {
    const currentRef = patientBannerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsTabletViewport(entry.contentRect.width < 1023);
      }
    });
    resizeObserver.observe(patientBannerRef.current);
    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
    };
  }, [patientBannerRef, setIsTabletViewport]);

  const patientName = patient ? displayName(patient) : '';

  const [showContactDetails, setShowContactDetails] = useState(false);
  const toggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const isDeceased = Boolean(patient?.deceasedDateTime);
  // render details button below patient details for workspaces
  // 520px is the maximum width a workspace occupies
  const showDetailsButtonBelowHeader = patientBannerRef.current?.scrollWidth <= 520;

  return (
    <header
      className={classNames(
        styles.container,
        isDeceased ? styles.deceasedPatientContainer : styles.activePatientContainer,
      )}
      ref={patientBannerRef}
    >
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar} role="img">
          <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
        </div>
        <PatientBannerPatientInfo patient={patient} />
        <div className={styles.buttonCol}>
          {!hideActionsOverflow ? (
            <PatientBannerActionsMenu
              patientUuid={patientUuid}
              actionsSlotName={'patient-actions-slot'}
              isDeceased={patient.deceasedBoolean}
            />
          ) : null}
          {!showDetailsButtonBelowHeader ? (
            <PatientBannerToggleContactDetailsButton
              className={styles.toggleContactDetailsButton}
              toggleContactDetails={toggleContactDetails}
              showContactDetails={showContactDetails}
            />
          ) : null}
        </div>
      </div>
      {showDetailsButtonBelowHeader ? (
        <PatientBannerToggleContactDetailsButton
          className={styles.toggleContactDetailsButton}
          toggleContactDetails={toggleContactDetails}
          showContactDetails={showContactDetails}
        />
      ) : null}
      {showContactDetails && (
        <div
          className={`${styles.contactDetails} ${styles[patient.deceasedBoolean && 'deceasedContactDetails']} ${
            styles[isTabletViewport && 'tabletContactDetails']
          }`}
        >
          <PatientBannerContactDetails patientId={patient?.id} deceased={isDeceased} />
        </div>
      )}
    </header>
  );
};

export default PatientBanner;
