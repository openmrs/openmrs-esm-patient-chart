import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';
import {
  createErrorHandler,
  fhirBaseUrl,
  showToast,
  showNotification,
  useConfig,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { DefaultWorkspaceProps, useVitalsConceptMetadata } from '@openmrs/esm-patient-common-lib';
import { Button, ButtonSet, Column, FlexGrid, Form, FormGroup, Row, Stack } from '@carbon/react';
import { calculateBMI, isInNormalRange } from './vitals-biometrics-form.utils';
import { savePatientVitals } from '../vitals.resource';
import { ConfigObject } from '../../config-schema';
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
  const session = useSession();
  const config = useConfig() as ConfigObject;
  const { cache, mutate }: { cache: any; mutate: Function } = useSWRConfig();
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();
  const biometricsUnitsSymbols = config.biometrics;
  const [patientVitalAndBiometrics, setPatientVitalAndBiometrics] = useState<PatientVitalsAndBiometrics>();
  const [patientBMI, setPatientBMI] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isBMIInNormalRange = (value: number | undefined | string) => {
    if (value === undefined || value === '') return true;
    return value >= 18.5 && value <= 24.9;
  };

  const savePatientVitalsAndBiometrics = (event: SyntheticEvent) => {
    event.preventDefault();
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
          closeWorkspace();

          showToast({
            critical: true,
            kind: 'success',
            title: t('vitalsAndBiometricsRecorded', 'Vitals and Biometrics saved'),
            description: t('vitalsAndBiometricsNowAvailable', 'They are now visible on the Vitals and Biometrics page'),
          });

          const apiUrlPattern = new RegExp(
            fhirBaseUrl + '\\/Observation\\?subject\\:Patient\\=' + patientUuid + '\\&code\\=',
          );

          // Find matching keys from SWR's cache and broadcast a revalidation message to their pre-bound SWR hooks
          Array.from(cache.keys())
            .filter((url: string) => apiUrlPattern.test(url))
            .forEach((url: string) => mutate(url));
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
  };

  useEffect(() => {
    if (patientVitalAndBiometrics?.height && patientVitalAndBiometrics?.weight) {
      const calculatedBmi = calculateBMI(
        Number(patientVitalAndBiometrics.weight),
        Number(patientVitalAndBiometrics.height),
      );
      setPatientBMI(calculatedBmi);
    }
  }, [patientVitalAndBiometrics?.weight, patientVitalAndBiometrics?.height]);

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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.temperatureUuid) ?? ''}
                inputIsNormal={isInNormalRange(
                  conceptMetadata,
                  config.concepts['temperatureUuid'],
                  patientVitalAndBiometrics?.temperature,
                )}
              />
            </Column>
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
                  },
                  {
                    name: t('diastolic', 'diastolic'),
                    type: 'number',
                    value: patientVitalAndBiometrics?.diastolicBloodPressure || '',
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}
                inputIsNormal={
                  isInNormalRange(
                    conceptMetadata,
                    config.concepts.systolicBloodPressureUuid,
                    patientVitalAndBiometrics?.systolicBloodPressure,
                  ) &&
                  isInNormalRange(
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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.pulseUuid) ?? ''}
                inputIsNormal={isInNormalRange(
                  conceptMetadata,
                  config.concepts['pulseUuid'],
                  patientVitalAndBiometrics?.pulse,
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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}
                inputIsNormal={isInNormalRange(
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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}
                inputIsNormal={isInNormalRange(
                  conceptMetadata,
                  config.concepts['respiratoryRateUuid'],
                  patientVitalAndBiometrics?.respiratoryRate,
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
                inputIsNormal={true}
              />
            </Column>
          </Row>
        </Stack>
        <Stack className={`${styles.spacer} ${styles.grid}`}>
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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.weightUuid) ?? ''}
                inputIsNormal={true}
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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.heightUuid) ?? ''}
                inputIsNormal={true}
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('bmiCalc', 'BMI (calc.)')}
                onInputChange={() => {}}
                textFields={[
                  {
                    name: t('bmi', 'BMI'),
                    type: 'number',
                    value: patientBMI || '',
                  },
                ]}
                unitSymbol={biometricsUnitsSymbols['bmiUnit']}
                disabled={true}
                inputIsNormal={isBMIInNormalRange(patientBMI)}
              />
            </Column>
            <Column className={styles.column}>
              <VitalsBiometricInput
                title={t('muac', 'MUAC')}
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
                  },
                ]}
                unitSymbol={conceptUnits.get(config.concepts.midUpperArmCircumferenceUuid) ?? ''}
                inputIsNormal={isInNormalRange(
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
