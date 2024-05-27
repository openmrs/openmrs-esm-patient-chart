import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  displayName,
  PatientBannerActionsMenu,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
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
  const maxDesktopWorkspaceWidthInPx = 520;
  const showDetailsButtonBelowHeader = patientBannerRef.current?.scrollWidth <= maxDesktopWorkspaceWidthInPx;

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
              actionsSlotName="patient-actions-slot"
              isDeceased={patient.deceasedBoolean}
              patientUuid={patientUuid}
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
          className={classNames(styles.contactDetails, {
            [styles.deceasedContactDetails]: patient.deceasedBoolean,
            [styles.tabletContactDetails]: isTabletViewport,
          })}
        >
          <PatientBannerContactDetails patientId={patient?.id} deceased={isDeceased} />
        </div>
      )}
    </header>
  );
};

export default PatientBanner;
