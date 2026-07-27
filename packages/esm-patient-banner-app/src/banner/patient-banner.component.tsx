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
  const patientBannerRef = useRef<HTMLElement>(null);
  const [bannerWidth, setBannerWidth] = useState<number | null>(null);
  const [showContactDetails, setShowContactDetails] = useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBannerWidth(entry.contentRect.width);
      }
    });
    if (patientBannerRef.current) {
      resizeObserver.observe(patientBannerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const isTabletViewport = bannerWidth !== null && bannerWidth < 1023;

  const patientName = patient ? getPatientName(patient) : '';

  const toggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const isDeceased = Boolean(patient?.deceasedDateTime);
  const maxDesktopWorkspaceWidthInPx = 520;
  const showDetailsButtonBelowHeader = bannerWidth !== null && bannerWidth <= maxDesktopWorkspaceWidthInPx;

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
        <div className={styles.patientAvatar}>
          <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
        </div>
        <PatientBannerPatientInfo patient={patient} renderedFrom="patient-chart" />
        <div className={styles.buttonCol} data-testid="patient-banner-button-col">
          <div className={styles.buttonRow}>
            {!hideActionsOverflow ? (
              <PatientBannerActionsMenu
                actionsSlotName="patient-actions-slot"
                patient={patient}
                patientUuid={patientUuid}
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
