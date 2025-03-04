import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  getPatientName,
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
  const [showContactDetails, setShowContactDetails] = useState(false);

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

  const patientName = patient ? getPatientName(patient) : '';

  const toggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const isDeceased = Boolean(patient?.deceasedDateTime);
  const maxDesktopWorkspaceWidthInPx = 520;
  const showDetailsButtonBelowHeader = patientBannerRef.current?.scrollWidth <= maxDesktopWorkspaceWidthInPx;

  return (
    <header
      aria-label="patient banner"
      className={classNames(
        styles.container,
        isDeceased ? styles.deceasedPatientContainer : styles.activePatientContainer,
      )}
      role="banner"
      ref={patientBannerRef}
    >
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar} role="img">
          <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
        </div>
        <PatientBannerPatientInfo patient={patient} />
        <div className={styles.buttonCol}>
          <div className={styles.buttonRow}>
            {!hideActionsOverflow ? (
              <PatientBannerActionsMenu
                actionsSlotName="patient-actions-slot"
                isDeceased={patient.deceasedBoolean}
                patientUuid={patientUuid}
                patient={patient}
              />
            ) : null}
          </div>
          {!showDetailsButtonBelowHeader ? (
            <PatientBannerToggleContactDetailsButton
              className={styles.toggleContactDetailsButton}
              showContactDetails={showContactDetails}
              toggleContactDetails={toggleContactDetails}
            />
          ) : null}
        </div>
      </div>
      {showDetailsButtonBelowHeader ? (
        <PatientBannerToggleContactDetailsButton
          className={styles.toggleContactDetailsButton}
          showContactDetails={showContactDetails}
          toggleContactDetails={toggleContactDetails}
        />
      ) : null}
      {showContactDetails && (
        <div
          className={classNames(styles.contactDetails, {
            [styles.deceasedContactDetails]: patient.deceasedBoolean,
            [styles.tabletContactDetails]: isTabletViewport,
          })}
        >
          <PatientBannerContactDetails deceased={isDeceased} patientId={patient?.id} />
        </div>
      )}
    </header>
  );
};

export default PatientBanner;
