import React, { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import Button from 'carbon-components-react/es/components/Button';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import capitalize from 'lodash-es/capitalize';
import styles from './patient-banner.scss';
import ContactDetails from '../contact-details/contact-details.component';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import { ExtensionSlot, age } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid }) => {
  const { t } = useTranslation();
  const [showContactDetails, setShowContactDetails] = useState(false);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const toggleContactDetails = useCallback(() => setShowContactDetails((value) => !value), []);

  return (
    <div className={styles.container}>
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar}>
          <ExtensionSlot extensionSlotName="patient-photo-slot" state={state} />
        </div>
        <div className={styles.patientInfo}>
          <div className={styles.row}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>
                {patient.name[0].given.join(' ')} {patient.name[0].family}
              </span>
              <ExtensionSlot
                extensionSlotName="patient-banner-tags-slot"
                state={{ patientUuid }}
                className={styles.flexRow}
              />
            </div>
            <div>
              <CustomOverflowMenuComponent
                menuTitle={
                  <>
                    <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                    <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
                  </>
                }>
                <ExtensionSlot
                  extensionSlotName="patient-actions-slot"
                  key="patient-actions-slot"
                  className={styles.overflowMenuItemList}
                  state={state}
                />
              </CustomOverflowMenuComponent>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.demographics}>
              <span>{capitalize(patient.gender)}</span> &middot; <span>{age(patient.birthDate)}</span> &middot;{' '}
              <span>{dayjs(patient.birthDate).format('DD - MMM - YYYY')}</span>
            </div>
          </div>
          <div className={styles.row}>
            <span className={styles.identifiers}>{patient.identifier.map((i) => i.value).join(', ')}</span>
            <Button
              kind="ghost"
              renderIcon={showContactDetails ? ChevronUp16 : ChevronDown16}
              iconDescription="Toggle contact details"
              onClick={toggleContactDetails}
              style={{ marginTop: '-0.25rem' }}>
              {showContactDetails ? t('showLess', 'Show less') : t('showAllDetails', 'Show all details')}
            </Button>
          </div>
        </div>
      </div>
      {showContactDetails && (
        <ContactDetails address={patient.address} telecom={patient.telecom} patientId={patient.id} />
      )}
    </div>
  );
};

export default PatientBanner;
