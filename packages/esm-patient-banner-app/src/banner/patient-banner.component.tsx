import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ChevronDown, ChevronUp, OverflowMenuVertical } from '@carbon/react/icons';
import { ExtensionSlot, PatientBannerPatientInfo, useConnectedExtensions } from '@openmrs/esm-framework';
import ContactDetails from '../contact-details/contact-details.component';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import styles from './patient-banner.scss';

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow }) => {
  const { t } = useTranslation();
  const overflowMenuRef = useRef(null);
  const patientBannerRef = useRef(null);
  const [isTabletViewport, setIsTabletViewport] = useState(false);
  const patientActions = useConnectedExtensions('patient-actions-slot');

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

  const patientActionsSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientPhotoSlotState = useMemo(() => ({ patientUuid, patientName }), [patientUuid, patientName]);

  const [showContactDetails, setShowContactDetails] = useState(false);
  const toggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const isDeceased = Boolean(patient?.deceasedDateTime);

  const patientAvatar = (
    <div className={styles.patientAvatar} role="img">
      <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
    </div>
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const closeDropdownMenu = useCallback(() => {
    setShowDropdown((value) => !value);
  }, []);

  return (
    <header
      className={classNames(
        styles.container,
        isDeceased ? styles.deceasedPatientContainer : styles.activePatientContainer,
      )}
      ref={patientBannerRef}
    >
      <div className={styles.patientBanner}>
        {patientAvatar}
        <PatientBannerPatientInfo patient={patient} />
        <div className={styles.buttonCol}>
          {!hideActionsOverflow && patientActions.length > 0 ? (
            <div className={styles.overflowMenuContainer} ref={overflowMenuRef}>
              <CustomOverflowMenuComponent
                deceased={isDeceased}
                menuTitle={
                  <>
                    <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                    <OverflowMenuVertical size={16} style={{ marginLeft: '0.5rem', fill: '#78A9FF' }} />
                  </>
                }
                dropDownMenu={showDropdown}
              >
                <ExtensionSlot
                  onClick={closeDropdownMenu}
                  name="patient-actions-slot"
                  key="patient-actions-slot"
                  className={styles.overflowMenuItemList}
                  state={patientActionsSlotState}
                />
              </CustomOverflowMenuComponent>
            </div>
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
