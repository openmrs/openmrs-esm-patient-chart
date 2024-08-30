import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { age, getPatientName, useConfig, getCoreTranslation } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import styles from './print-identifier-sticker.scss';

interface IdentifierStickerProps {
  patient: fhir.Patient;
}

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

const IdentifierSticker = forwardRef<HTMLDivElement, IdentifierStickerProps>(({ patient }, ref) => {
  const { t } = useTranslation();
  const { printIdentifierStickerFields, excludePatientIdentifierCodeTypes } = useConfig<ConfigObject>();

  const patientDetails = useMemo(() => {
    if (!patient) {
      return {};
    }

    const identifiers =
      patient.identifier?.filter(
        (identifier) => !excludePatientIdentifierCodeTypes?.uuids.includes(identifier.type.coding[0].code),
      ) ?? [];

    return {
      address: patient.address,
      age: age(patient.birthDate),
      dateOfBirth: patient.birthDate,
      gender: getGender(patient.gender),
      id: patient.id,
      identifiers: [...identifiers],
      name: patient ? getPatientName(patient) : '',
      photo: patient.photo,
    };
  }, [excludePatientIdentifierCodeTypes?.uuids, patient]);

  return (
    <div ref={ref} className={styles.stickerContainer}>
      {printIdentifierStickerFields.includes('name') && <div className={styles.patientName}>{patientDetails.name}</div>}
      {patientDetails.identifiers.map((identifier) => {
        return (
          <p key={identifier?.id}>
            {identifier?.type?.text}: <span className="patient-identifier">{identifier?.value}</span>
          </p>
        );
      })}
      <p>
        {getCoreTranslation('sex', 'Sex')}: <span className="patient-gender">{patientDetails.gender}</span>
      </p>
      <p>
        {t('dob', 'DOB')}: <span className="patient-dob">{patientDetails.dateOfBirth}</span>
      </p>
      <p>
        {getCoreTranslation('age', 'Age')}: <span className="patient-age">{patientDetails.age}</span>
      </p>
    </div>
  );
});

export default IdentifierSticker;
