import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  displayName,
  PatientBannerActionsMenu,
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  PatientPhoto,
  showModal,
  useConfig,
} from '@openmrs/esm-framework';
import { Printer } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import styles from './patient-banner.scss';
import { type ConfigObject } from '../config-schema';

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow }) => {
  const { t } = useTranslation();
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

  const { showPrintIdentifierStickerButton } = useConfig<ConfigObject>();

  const openModal = useCallback(() => {
    const dispose = showModal('print-identifier-sticker-modal', {
      closeModal: () => dispose(),
      patient,
    });
  }, [patient]);

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
          <div className={styles.buttonRow}>
            {showPrintIdentifierStickerButton && (
              <Button
                kind="ghost"
                hasIconOnly={true}
                renderIcon={(props) => <Printer size={16} {...props} />}
                iconDescription={t('printIdentifierSticker', 'Print Identification Sticker')}
                tooltipPosition="bottom"
                className={styles.printButton}
                onClick={openModal}
              />
            )}
            {!hideActionsOverflow ? (
              <PatientBannerActionsMenu
                actionsSlotName="patient-actions-slot"
                isDeceased={patient.deceasedBoolean}
                patientUuid={patientUuid}
              />
            ) : null}
          </div>
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
