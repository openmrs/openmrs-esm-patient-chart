import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from '@carbon/react';
import { ChevronDown, ChevronUp, OverflowMenuVertical } from '@carbon/react/icons';
import { ExtensionSlot, age, formatDate, parseDate, useConfig, useConnectedExtensions } from '@openmrs/esm-framework';
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
  const { t } = useTranslation();
  const overflowMenuRef = useRef(null);
  const patientBannerRef = useRef(null);
  const [isTabletViewport, setIsTabletViewport] = useState(false);
  const { excludePatientIdentifierCodeTypes } = useConfig();
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

  const isDeceased = Boolean(patient?.deceasedDateTime);

  const patientAvatar = (
    <div className={styles.patientAvatar} role="img">
      <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
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

  const showActionsMenu = useMemo(
    () => !hideActionsOverflow && patientActions.length > 0,
    [patientActions.length, hideActionsOverflow],
  );

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

  const identifiers =
    patient?.identifier?.filter(
      (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
    ) ?? [];

  return (
    <div
      className={classNames(
        styles.container,
        isDeceased ? styles.deceasedPatientContainer : styles.activePatientContainer,
      )}
      role="banner"
      ref={patientBannerRef}
    >
      <div
        className={classNames(styles.patientBanner, { [styles.patientAvatarButton]: onClick })}
        onClick={handleNavigateToPatientChart}
        role="button"
        tabIndex={0}
      >
        {patientAvatar}
        <div className={styles.patientInfo}>
          <div className={classNames(styles.row, styles.patientNameRow)}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>{patientName}</span>
              <ExtensionSlot
                name="patient-banner-tags-slot"
                state={{ patientUuid, patient }}
                className={styles.flexRow}
              />
            </div>
            {showActionsMenu && (
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
            )}
          </div>
          <div className={styles.demographics}>
            <span>{getGender(patient.gender)}</span> &middot; <span>{age(patient.birthDate)}</span> &middot;{' '}
            <span>{formatDate(parseDate(patient.birthDate), { mode: 'wide', time: false })}</span>
          </div>
          <div className={styles.row}>
            <div className={styles.identifiers}>
              {identifiers?.length
                ? identifiers.map(({ value, type }) => (
                    <span key={value} className={styles.identifierTag}>
                      <Tag className={styles.tag} type="gray" title={type.text}>
                        {type.text}
                      </Tag>
                      {value}
                    </span>
                  ))
                : ''}
            </div>
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
    </div>
  );
};

export default PatientBanner;
