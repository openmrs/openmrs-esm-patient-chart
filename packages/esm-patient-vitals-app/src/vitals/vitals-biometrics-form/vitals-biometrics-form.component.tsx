import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Column, Form, Row, Stack } from '@carbon/react';
import {
  age,
  createErrorHandler,
  showToast,
  showNotification,
  useConfig,
  useLayoutType,
  useSession,
  ExtensionSlot,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import { DefaultWorkspaceProps, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import {
  calculateBodyMassIndex,
  isValueWithinReferenceRange,
  extractNumbers,
  getColorCode,
} from './vitals-biometrics-form.utils';
import { savePatientVitals, useVitals } from '../vitals.resource';
import type { ConfigObject } from '../../config-schema';
import VitalsBiometricInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.scss';

export interface PatientVitalsAndBiometrics {
  systolicBloodPressure: string;
  diastolicBloodPressure: string;
  pulse: string;
  oxygenSaturation: string;
  respiratoryRate: string;
  generalPatientNote: string;
  weight?: string;
  height?: string;
  temperature?: string;
  midUpperArmCircumference?: string;
}

const VitalsAndBiometricForms: React.FC<DefaultWorkspaceProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config: ConfigObject = useConfig();
  const biometricsUnitsSymbols = config.biometrics;
  const useMuacColorStatus = config.vitals.useMuacColors;

  const session = useSession();
  const patient = usePatient(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const { mutate } = useVitals(patientUuid);
  const { data: conceptUnits, conceptMetadata, conceptRanges } = useVitalsConceptMetadata();
  const [patientVitalAndBiometrics, setPatientVitalAndBiometrics] = useState<PatientVitalsAndBiometrics>();
  const [bodyMassIndex, setBodyMassIndex] = useState<number>();
  const [muacColorCode, setMuacColorCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const encounterUuid = currentVisit?.encounters?.find(
    (encounter) => encounter?.form?.uuid === config.vitals.formUuid,
  )?.uuid;

  const isBodyMassIndexValueAbnormal = (bmi: number) => {
    if (!bmi) return false;
    return bmi < 18.5 || bmi > 24.9;
  };

  useEffect(() => {
    getColorCode(
      extractNumbers(age(patient.patient?.birthDate)),
      parseInt(patientVitalAndBiometrics?.midUpperArmCircumference),
      setMuacColorCode,
    );
  }, [patient.patient?.birthDate, patientVitalAndBiometrics?.midUpperArmCircumference]);

  const concepts = {
    midUpperArmCircumferenceRange: conceptRanges.get(config.concepts.midUpperArmCircumferenceUuid),
    diastolicBloodPressureRange: conceptRanges.get(config.concepts.diastolicBloodPressureUuid),
    systolicBloodPressureRange: conceptRanges.get(config.concepts.systolicBloodPressureUuid),
    oxygenSaturationRange: conceptRanges.get(config.concepts.oxygenSaturationUuid),
    respiratoryRateRange: conceptRanges.get(config.concepts.respiratoryRateUuid),
    temperatureRange: conceptRanges.get(config.concepts.temperatureUuid),
    weightRange: conceptRanges.get(config.concepts.weightUuid),
    heightRange: conceptRanges.get(config.concepts.heightUuid),
    pulseRange: conceptRanges.get(config.concepts.pulseUuid),
  };

  const savePatientVitalsAndBiometrics = (event: SyntheticEvent) => {
    event.preventDefault();
    let isFieldValid = true;
    for (let key in patientVitalAndBiometrics) {
      if (
        isValueWithinReferenceRange(conceptMetadata, config.concepts[key + 'Uuid'], patientVitalAndBiometrics[key]) ==
        false
      ) {
        isFieldValid = false;
        showNotification({
          title: t('vitalsAndBiometricsSaveError', 'Error saving vitals and biometrics'),
          kind: 'error',
          critical: true,
          description: t('checkForValidity', 'Some of the values entered are invalid'),
        });
        break;
      }
    }
    if (isFieldValid) {
      setIsSubmitting(true);
      const ac = new AbortController();
      savePatientVitals(
        config.vitals.encounterTypeUuid,
        config.vitals.formUuid,
        config.concepts,
        patientUuid,
        patientVitalAndBiometrics,
        new Date(),
        ac,
        session?.sessionLocation?.uuid,
      )
        .then((response) => {
          if (response.status === 201) {
            mutate();
            closeWorkspace();

            showToast({
              critical: true,
              kind: 'success',
              title: t('vitalsAndBiometricsRecorded', 'Vitals and Biometrics saved'),
              description: t(
                'vitalsAndBiometricsNowAvailable',
                'They are now visible on the Vitals and Biometrics page',
              ),
            });
          }
        })
        .catch((err) => {
          createErrorHandler();

          showNotification({
            title: t('vitalsAndBiometricsSaveError', 'Error saving vitals and biometrics'),
            kind: 'error',
            critical: true,
            description: err?.message,
          });
        })
        .finally(() => {
          ac.abort();
        });
    }
  };

  useEffect(() => {
    if (patientVitalAndBiometrics?.height && patientVitalAndBiometrics?.weight) {
      const computedBodyMassIndex = calculateBodyMassIndex(
        Number(patientVitalAndBiometrics.weight),
        Number(patientVitalAndBiometrics.height),
      );
      setBodyMassIndex(computedBodyMassIndex);
    }
  }, [patientVitalAndBiometrics?.weight, patientVitalAndBiometrics?.height]);

  if (config.vitals.useFormEngine) {
    return (
      <ExtensionSlot
        name="form-widget-slot"
        state={{
          view: 'form',
          formUuid: config.vitals.formUuid,
          visitUuid: currentVisit?.uuid,
          visitTypeUuid: currentVisit?.visitType?.uuid,
          patientUuid: patientUuid ?? null,
          patient,
          encounterUuid,
          closeWorkspace,
        }}
      />
    );
  }

  return (
    <Form className={styles.form}>
      <div className={styles.grid}>
        <Stack>
          <Column className={styles.column}>
            <p className={styles.vitalsTitle}>{t('recordVitals', 'Record vitals')}</p>
          </Column>
          <Row className={styles.row}>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('bloodPressure', 'Blood Pressure')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  event.target.name === 'systolic'
                    ? setPatientVitalAndBiometrics({
                        ...patientVitalAndBiometrics,
                        systolicBloodPressure: event.target.value,
                      })
                    : setPatientVitalAndBiometrics({
                        ...patientVitalAndBiometrics,
                        diastolicBloodPressure: event.target.value,
                      });
                }}
                textFields={[
                  {
                    name: t('systolic', 'systolic'),
                    separator: '/',
                    type: 'number',
                    value: patientVitalAndBiometrics?.systolicBloodPressure || '',
                    min: concepts.systolicBloodPressureRange.lowAbsolute,
                    max: concepts.systolicBloodPressureRange.highAbsolute,
                  },
                  {
                    name: t('diastolic', 'diastolic'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.diastolicBloodPressure || '',
                    min: concepts.diastolicBloodPressureRange.lowAbsolute,
                    max: concepts.diastolicBloodPressureRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
                isWithinNormalRange={
                  isValueWithinReferenceRange(
                    conceptMetadata,
                    config.concepts.systolicBloodPressureUuid,
                    patientVitalAndBiometrics?.systolicBloodPressure,
                  ) &&
                  isValueWithinReferenceRange(
                    conceptMetadata,
                    config.concepts.diastolicBloodPressureUuid,
                    patientVitalAndBiometrics?.diastolicBloodPressure,
                  )
                }
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('pulse', 'Pulse')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    pulse: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('pulse', 'Pulse'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.pulse || '',
                    min: concepts.pulseRange.lowAbsolute,
                    max: concepts.pulseRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['pulseUuid'],
                  patientVitalAndBiometrics?.pulse,
                )}
              />
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('respirationRate', 'Respiration Rate')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    respiratoryRate: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('respirationRate', 'Respiration Rate'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.respiratoryRate || '',
                    min: concepts.respiratoryRateRange.lowAbsolute,
                    max: concepts.respiratoryRateRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['respiratoryRateUuid'],
                  patientVitalAndBiometrics?.respiratoryRate,
                )}
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('spo2', 'SpO2')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    oxygenSaturation: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('oxygenSaturation', 'Oxygen Saturation'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.oxygenSaturation || '',
                    min: concepts.oxygenSaturationRange.lowAbsolute,
                    max: concepts.oxygenSaturationRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['oxygenSaturationUuid'],
                  patientVitalAndBiometrics?.oxygenSaturation,
                )}
              />
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('temp', 'Temp')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    temperature: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('temperature', 'Temperature'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.temperature || '',
                    min: concepts.temperatureRange.lowAbsolute,
                    max: concepts.temperatureRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['temperatureUuid'],
                  patientVitalAndBiometrics?.temperature,
                )}
              />
            </Column>
          </Row>

          <Row className={styles.row}>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('notes', 'Notes')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    generalPatientNote: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('notes', 'Notes'),
                    type: 'textArea',
                    value: patientVitalAndBiometrics?.generalPatientNote,
                  },
                ]}
                textFieldWidth="26.375rem"
                placeholder={t('additionalNoteText', 'Type any additional notes here')}
              />
            </Column>
          </Row>
        </Stack>
        <Stack className={styles.spacer}>
          <Column className={styles.column}>
            <p className={styles.vitalsTitle}>{t('recordBiometrics', 'Record biometrics')}</p>
          </Column>
          <Row className={styles.row}>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('weight', 'Weight')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    weight: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('weight', 'Weight'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.weight || '',
                    min: concepts.weightRange.lowAbsolute,
                    max: concepts.weightRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.weightUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['weightUuid'],
                  patientVitalAndBiometrics?.weight,
                )}
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('height', 'Height')}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    height: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('height', 'Height'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.height || '',
                    min: concepts.heightRange.lowAbsolute,
                    max: concepts.heightRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.heightUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['heightUuid'],
                  patientVitalAndBiometrics?.height,
                )}
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('calculatedBmi', 'BMI (calc.)')}
                onInputChange={() => {}}
                textFields={[
                  {
                    name: t('bmi', 'BMI'),
                    type: 'number',
                    value: bodyMassIndex || '',
                  },
                ]}
                unitSymbol={biometricsUnitsSymbols['bmiUnit']}
                disabled
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('muac', 'MUAC')}
                useMuacColors={useMuacColorStatus}
                muacColorCode={muacColorCode}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setPatientVitalAndBiometrics({
                    ...patientVitalAndBiometrics,
                    midUpperArmCircumference: event.target.value,
                  });
                }}
                textFields={[
                  {
                    name: t('muac', 'MUAC'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.midUpperArmCircumference || '',
                    min: concepts.midUpperArmCircumferenceRange.lowAbsolute,
                    max: concepts.midUpperArmCircumferenceRange.highAbsolute,
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? ''}
                isWithinNormalRange={isValueWithinReferenceRange(
                  conceptMetadata,
                  config.concepts['midUpperArmCircumferenceUuid'],
                  patientVitalAndBiometrics?.midUpperArmCircumference,
                )}
              />
            </Column>
          </Row>
        </Stack>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          onClick={savePatientVitalsAndBiometrics}
          disabled={isSubmitting}
          type="submit"
        >
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default VitalsAndBiometricForms;
