import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { age, type CoreTranslationKey, getCoreTranslation, getPatientName, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker.scss';

export interface PatientDetailProps {
  patient: fhir.Patient;
  showFieldSeparator: boolean;
}

export const PatientName: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldRow}>
      <span className={styles.patientDetailLabel}>
        {showFieldSeparator ? t('patientNameWithSeparator', 'Patient name:') : t('patientName', 'Patient name')}
      </span>
      <span className={styles.patientDetail}>{getPatientName(patient)}</span>
    </div>
  );
};

export const PatientAge: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldRow}>
      <span className={styles.patientDetailLabel}>
        {showFieldSeparator ? t('patientAgeWithSeparator', 'Age:') : t('patientAge', 'Age')}
      </span>
      <span className={styles.patientDetail}>{age(patient.birthDate)}</span>
    </div>
  );
};

export const PatientDob: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.fieldRow}>
      <span className={styles.patientDetailLabel}>
        {showFieldSeparator
          ? t('patientDateOfBirthWithSeparator', 'Date of birth:')
          : t('patientDateOfBirth', 'Date of birth')}
      </span>
      <span className={styles.patientDetail}>{dayjs(patient.birthDate).format('DD-MM-YYYY')}</span>
    </div>
  );
};

export const PatientGender: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const { t } = useTranslation();
  const getGender = (gender: string): string => {
    switch (gender) {
      case 'male':
        return getCoreTranslation('male', 'Male');
      case 'female':
        return getCoreTranslation('female', 'Female');
      case 'other':
        return getCoreTranslation('other', 'Other');
      case 'unknown':
        return getCoreTranslation('unknown', 'Unknown');
      default:
        return gender;
    }
  };
  return (
    <div className={styles.fieldRow}>
      <span className={styles.patientDetailLabel}>
        {showFieldSeparator ? t('patientGenderWithSeparator', 'Gender:') : t('patientGender', 'Gender')}
      </span>
      <span className={styles.patientDetail}>{getGender(patient.gender)}</span>
    </div>
  );
};

export const PatientIdentifier: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const { printPatientSticker } = useConfig<ConfigObject>();
  const { identifiersToDisplay } = printPatientSticker ?? {};
  const patientIdentifiers =
    (identifiersToDisplay ?? []).length === 0
      ? patient.identifier
      : patient.identifier?.filter((identifier) => identifiersToDisplay.includes(identifier.type.coding[0].code));
  return (
    <div className={styles.fieldRow}>
      {patientIdentifiers?.map((identifier) => (
        <div key={identifier.id} className={styles.fieldRow}>
          <span className={styles.patientDetailLabel}>
            {identifier.type.text}
            {showFieldSeparator ? ':' : ''}
          </span>
          <span className={styles.patientDetail}>{identifier.value}</span>
        </div>
      ))}
    </div>
  );
};

export const PatientContact: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const { t } = useTranslation();

  if (!patient?.telecom?.length) {
    return null;
  }

  return (
    <div className={styles.fieldRow}>
      <span className={styles.patientDetailLabel}>
        {showFieldSeparator
          ? t('telephoneNumberWithSeparator', 'Telephone number:')
          : t('telephoneNumber', 'Telephone number')}
      </span>
      <span className={styles.patientDetail}>{patient.telecom?.[0]?.value}</span>
    </div>
  );
};

export const PatientAddress: React.FC<PatientDetailProps> = ({ patient, showFieldSeparator }) => {
  const address = patient?.address?.find((a) => a.use === 'home');
  const getAddressKey = (url: string) => url.split('#')[1];

  return (
    <>
      {address ? (
        Object.entries(address)
          .filter(([key]) => key !== 'id' && key !== 'use')
          .map(([key, value]) =>
            key === 'extension' ? (
              address.extension?.[0]?.extension?.map((add, i) => (
                <div key={`address-${key}-${i}`} className={styles.fieldRow}>
                  <span className={styles.patientDetailLabel}>
                    {getCoreTranslation(
                      getAddressKey(add.url) as CoreTranslationKey,
                      getAddressKey(add.url) as CoreTranslationKey,
                    )}
                    {showFieldSeparator ? ':' : ''}
                  </span>
                  <span className={styles.patientDetail}>{add.valueString}</span>
                </div>
              ))
            ) : (
              <div key={`address-${key}`} className={styles.fieldRow}>
                <span className={styles.patientDetailLabel}>
                  {getCoreTranslation(key as CoreTranslationKey, key)}
                  {showFieldSeparator ? ':' : ''}
                </span>
                <span className={styles.patientDetail}>{value}</span>
              </div>
            ),
          )
      ) : (
        <li>--</li>
      )}
    </>
  );
};
