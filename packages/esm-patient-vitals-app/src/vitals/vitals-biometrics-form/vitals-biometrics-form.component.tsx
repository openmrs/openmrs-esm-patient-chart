import React, { useEffect, useState } from 'react';
import VitalsBiometricInput from './vitals-biometrics-input.component';
import styles from './vitals-biometrics-form.component.scss';
import { useTranslation } from 'react-i18next';
import { useConfig, createErrorHandler, useSessionUser, showToast, showNotification } from '@openmrs/esm-framework';
import { Column, Grid, Row, Button } from 'carbon-components-react';
import { calculateBMI, isInNormalRange } from './vitals-biometrics-form.utils';
import { savePatientVitals } from '../vitals-biometrics.resource';
import { useVitalsSignsConceptMetaData } from './use-vitalsigns';
import { ConfigObject } from '../../config-schema';

interface VitalsAndBiometricFormProps {
  patientUuid: string;
  closeWorkspace(): void;
  isTablet: boolean;
}

export interface PatientVitalAndBiometric {
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

const VitalsAndBiometricForms: React.FC<VitalsAndBiometricFormProps> = ({ patientUuid, closeWorkspace, isTablet }) => {
  const session = useSessionUser();
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const { vitalsSignsConceptMetadata, conceptsUnits } = useVitalsSignsConceptMetaData();
  const biometricsUnitsSymbols = config.biometrics;
  const [patientVitalAndBiometrics, setPatientVitalAndBiometrics] = useState<PatientVitalAndBiometric>();
  const [patientBMI, setPatientBMI] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [
    bloodPressureUnit,
    ,
    temperatureUnit,
    heightUnit,
    weightUnit,
    pulseUnit,
    oxygenSaturationUnit,
    midUpperArmCircumferenceUnit,
    respiratoryRateUnit,
  ] = conceptsUnits;

  const isBMIInNormalRange = (value: number | undefined | string) => {
    if (value === undefined || value === '') return true;
    return value >= 18.5 && value <= 24.9;
  };

  const savePatientVitalsAndBiometrics = () => {
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
            title: t('vitalSignsRecorded', 'Vital Signs Recorded'),
            kind: 'success',
            description: t('vitalsAndBiometricsSaved', 'Most recent vital signs are visible below the patient header'),
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
    <Grid condensed>
      <Row>
        <Column>
          <p className={styles.vitalsTitle}>{t('vitals', 'Vitals')}</p>
        </Column>
      </Row>
      <Row>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.systolicBloodPressure || '',
              },
              {
                name: t('diastolic', 'diastolic'),
                type: 'text',
                value: patientVitalAndBiometrics?.diastolicBloodPressure || '',
              },
            ]}
            unitSymbol={bloodPressureUnit}
            inputIsNormal={
              isInNormalRange(
                vitalsSignsConceptMetadata,
                config.concepts.systolicBloodPressureUuid,
                patientVitalAndBiometrics?.systolicBloodPressure,
              ) &&
              isInNormalRange(
                vitalsSignsConceptMetadata,
                config.concepts.diastolicBloodPressureUuid,
                patientVitalAndBiometrics?.diastolicBloodPressure,
              )
            }
            isTablet={isTablet}
          />
        </Column>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.pulse || '',
              },
            ]}
            unitSymbol={pulseUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts['pulseUuid'],
              patientVitalAndBiometrics?.pulse,
            )}
            isTablet={isTablet}
          />
        </Column>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.oxygenSaturation || '',
              },
            ]}
            unitSymbol={oxygenSaturationUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts['oxygenSaturationUuid'],
              patientVitalAndBiometrics?.oxygenSaturation,
            )}
            isTablet={isTablet}
          />
        </Column>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.respiratoryRate || '',
              },
            ]}
            unitSymbol={respiratoryRateUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts['respiratoryRateUuid'],
              patientVitalAndBiometrics?.respiratoryRate,
            )}
            isTablet={isTablet}
          />
        </Column>
      </Row>
      <Row>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.temperature || '',
              },
            ]}
            unitSymbol={temperatureUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts['temperatureUuid'],
              patientVitalAndBiometrics?.temperature,
            )}
            isTablet={isTablet}
          />
        </Column>
      </Row>
      <Row>
        <Column>
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
            isTablet={isTablet}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <p className={styles.vitalsTitle}>{t('biometrics', 'Biometrics')}</p>
        </Column>
      </Row>
      <Row>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.weight || '',
              },
            ]}
            unitSymbol={weightUnit}
            inputIsNormal={true}
            isTablet={isTablet}
          />
        </Column>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.height || '',
              },
            ]}
            unitSymbol={heightUnit}
            inputIsNormal={true}
            isTablet={isTablet}
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t('bmiCalc', 'BMI (calc.)')}
            onInputChange={() => {}}
            textFields={[
              {
                name: t('bmi', 'BMI'),
                type: 'text',
                value: patientBMI || '',
              },
            ]}
            unitSymbol={biometricsUnitsSymbols['bmiUnit']}
            disabled={true}
            inputIsNormal={isBMIInNormalRange(patientBMI)}
            isTablet={isTablet}
          />
        </Column>
        <Column>
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
                type: 'text',
                value: patientVitalAndBiometrics?.midUpperArmCircumference || '',
              },
            ]}
            unitSymbol={midUpperArmCircumferenceUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts['midUpperArmCircumferenceUuid'],
              patientVitalAndBiometrics?.midUpperArmCircumference,
            )}
            isTablet={isTablet}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <Button onClick={closeWorkspace} className={styles.vitalsButton} kind="secondary">
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={savePatientVitalsAndBiometrics}
            className={styles.vitalsButton}
            kind="primary">
            {t('signAndSave', 'Sign & Save')}
          </Button>
        </Column>
      </Row>
    </Grid>
  );
};

export default VitalsAndBiometricForms;
