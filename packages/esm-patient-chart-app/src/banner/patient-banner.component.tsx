import React, { MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ChevronDown, ChevronUp, OverflowMenuVertical } from '@carbon/react/icons';
import { ExtensionSlot, age, formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import ContactDetails from '../contact-details/contact-details.component';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import styles from './patient-banner.scss';

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
  onClick?: (patientUuid: string) => void;
  onTransition?: () => void;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  patientUuid,
  onClick,
  onTransition,
  hideActionsOverflow,
}) => {
  const { excludePatientIdentifierCodeTypes } = useConfig();
  const { t } = useTranslation();
  const overflowMenuRef = useRef(null);

  const patientActionsSlotState = useMemo(
    () => ({ patientUuid, onClick, onTransition }),
    [patientUuid, onClick, onTransition],
  );

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientPhotoSlotState = useMemo(() => ({ patientUuid, patientName }), [patientUuid, patientName]);

  const [showContactDetails, setShowContactDetails] = useState(false);
  const toggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const patientAvatar = (
    <div className={styles.patientAvatar} role="img">
      <ExtensionSlot extensionSlotName="patient-photo-slot" state={patientPhotoSlotState} />
    </div>
  );

  const handleNavigateToPatientChart = useCallback(
    (event: MouseEvent) => {
      if (onClick) {
        !(overflowMenuRef?.current && overflowMenuRef?.current.contains(event.target)) && onClick(patientUuid);
      }
    },
    [onClick, patientUuid],
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const closeDropdownMenu = useCallback(() => {
    setShowDropdown((value) => !value);
  }, []);

  const getGender = (gender: string): string => {
    switch (gender) {
      case 'male':
        return t('male', 'Male');
      case 'female':
        return t('female', 'Female');
      case 'other':
        return t('other', 'Other');
      case 'unknown':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };

  const identifiers = patient?.identifier?.filter(
    (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
  );

  return (
    <div className={styles.container} role="banner">
      <div
        onClick={handleNavigateToPatientChart}
        tabIndex={0}
        role="button"
        className={`${styles.patientBanner} ${onClick && styles.patientAvatarButton}`}
      >
        {patientAvatar}
        <div className={styles.patientInfo}>
          <div className={`${styles.row} ${styles.patientNameRow}`}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>{patientName}</span>
              <ExtensionSlot
                extensionSlotName="patient-banner-tags-slot"
                state={{ patientUuid, patient }}
                className={styles.flexRow}
              />
            </div>
            {!hideActionsOverflow && (
              <div ref={overflowMenuRef}>
                <CustomOverflowMenuComponent
                  menuTitle={
                    <>
                      <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                      <OverflowMenuVertical size={16} style={{ marginLeft: '0.5rem' }} />
                    </>
                  }
                  dropDownMenu={showDropdown}
                >
                  <ExtensionSlot
                    onClick={closeDropdownMenu}
                    extensionSlotName="patient-actions-slot"
                    key="patient-actions-slot"
                    className={styles.overflowMenuItemList}
                    state={patientActionsSlotState}
                  />
                </CustomOverflowMenuComponent>
              </div>
            )}
          </div>
          <div className={styles.demographics}>
            <span>{getGender(patient.gender)}</span> &middot; <span>{age(patient.birthDate)}</span> &middot;{' '}
            <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
          </div>
          <div className={styles.row}>
            <div className={styles.identifiers}>
              {identifiers.length
                ? identifiers.map(({ value, type }) => (
                    <span className={styles.identifierTag}>
                      <Tag key={value} className={styles.tag} type="gray" title={type.text}>
                        {type.text}
                      </Tag>
                      {value}
                    </span>
                  ))
                : ''}
            </div>
            <Button
              kind="ghost"
              renderIcon={(props) =>
                showContactDetails ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
              }
              iconDescription="Toggle contact details"
              onClick={toggleContactDetails}
              style={{ marginTop: '-0.25rem' }}
            >
              {showContactDetails ? t('showLess', 'Show less') : t('showAllDetails', 'Show all details')}
            </Button>
          </div>
        </div>
      </div>
      {showContactDetails && (
        <ContactDetails address={patient?.address ?? []} telecom={patient?.telecom ?? []} patientId={patient?.id} />
      )}
    </div>
  );
};

export default PatientBanner;
