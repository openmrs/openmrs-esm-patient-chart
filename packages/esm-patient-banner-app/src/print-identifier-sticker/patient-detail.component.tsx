import React from 'react';
import { age, type CoreTranslationKey, getCoreTranslation, getPatientName, useConfig } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { type ConfigObject } from '../config-schema';
import { useTranslation } from 'react-i18next';
import styles from './print-identifier-sticker.scss';

export interface PatientDetailProps {
  patient: fhir.Patient;
}

export const PatientName: React.FC<PatientDetailProps> = ({ patient }) => {
  const { t } = useTranslation();
  return (
    <div>
      <span>
        <strong className={styles.strong}>{t('patientNameWithSeparator', 'Patient name:')}</strong>
      </span>
      <span className={styles.patientDetail}>{getPatientName(patient)}</span>
    </div>
  );
};

export const PatientAge: React.FC<PatientDetailProps> = ({ patient }) => {
  const { t } = useTranslation();
  return (
    <div>
      <span>
        <strong className={styles.strong}>{t('patientAge', 'Age:')}</strong>
      </span>
      <span className={styles.patientDetail}>{age(patient.birthDate)}</span>
    </div>
  );
};

export const PatientDob: React.FC<PatientDetailProps> = ({ patient }) => {
  const { t } = useTranslation();
  return (
    <div>
      <span>
        <strong className={styles.strong}>{t('patientDateOfBirthWithSeparator', 'Date of birth:')}</strong>
      </span>
      <span className={styles.patientDetail}>{dayjs(patient.birthDate).format('DD-MM-YYYY')}</span>
    </div>
  );
};

export const PatientGender: React.FC<PatientDetailProps> = ({ patient }) => {
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
    <div>
      <span>
        <strong className={styles.strong}>{t('patientGenderWithSeparator', 'Gender:')}</strong>
      </span>
      <span className={styles.patientDetail}>{getGender(patient.gender)}</span>
    </div>
  );
};

export const PatientIdentifier: React.FC<PatientDetailProps> = ({ patient }) => {
  const { printPatientSticker } = useConfig<ConfigObject>();
  const { identifiersToDisplay } = printPatientSticker ?? {};
  const patientIdentifiers =
    (identifiersToDisplay ?? []).length === 0
      ? patient.identifier
      : patient.identifier?.filter((identifier) => identifiersToDisplay.includes(identifier.type.coding[0].code));
  return (
    <div>
      {patientIdentifiers?.map((identifier) => (
        <div key={identifier.id}>
          <span>
            <strong className={styles.strong}>{identifier.type.text}:</strong>
          </span>
          <span className={styles.patientDetail}>{identifier.value}</span>
        </div>
      ))}
    </div>
  );
};

export const PatientContact: React.FC<PatientDetailProps> = ({ patient }) => {
  const { t } = useTranslation();

  if (patient.telecom.length == 0) {
    return null;
  }

  return (
    <div>
      <span>
        <strong className={styles.strong}>{t('telephoneNumberWithSeparator', 'Telephone number:')}</strong>
      </span>
      <span className={styles.patientDetail}>{patient.telecom[0]?.value}</span>
    </div>
  );
};

export const PatientAddress: React.FC<PatientDetailProps> = ({ patient }) => {
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
                <div key={`address-${key}-${i}`}>
                  <span className={styles.strong}>
                    {getCoreTranslation(
                      getAddressKey(add.url) as CoreTranslationKey,
                      getAddressKey(add.url) as CoreTranslationKey,
                    )}
                    :
                  </span>
                  <span className={styles.patientDetail}>{add.valueString}</span>
                </div>
              ))
            ) : (
              <div key={`address-${key}`}>
                <span className={styles.strong}>{getCoreTranslation(key as CoreTranslationKey, key)}:</span>
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
