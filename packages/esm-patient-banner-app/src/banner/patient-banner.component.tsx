import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import { PatientBannerActionsMenu, PatientBannerPatientInfo, PatientPhoto } from '@openmrs/esm-framework';
import ContactDetails from '../contact-details/contact-details.component';
import styles from './patient-banner.scss';

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

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  const [showContactDetails, setShowContactDetails] = useState(false);
  const toggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const isDeceased = Boolean(patient?.deceasedDateTime);

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
          <Button
            className={styles.toggleContactDetailsButton}
            kind="ghost"
            renderIcon={(props) =>
              showContactDetails ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
            }
            iconDescription="Toggle contact details"
            onClick={toggleContactDetails}
            style={{ marginTop: '-0.25rem' }}
          >
            {showContactDetails ? t('hideDetails', 'Hide details') : t('showDetails', 'Show details')}
          </Button>
        </div>
      </div>
      {showContactDetails && (
        <ContactDetails
          isTabletViewport={isTabletViewport}
          address={patient?.address ?? []}
          telecom={patient?.telecom ?? []}
          patientId={patient?.id}
          deceased={isDeceased}
        />
      )}
    </header>
  );
};

export default PatientBanner;
