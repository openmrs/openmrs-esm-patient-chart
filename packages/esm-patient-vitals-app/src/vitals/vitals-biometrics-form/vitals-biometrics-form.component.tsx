import React, { useEffect, useState } from "react";
import VitalsBiometricInput from "./vitals-biometrics-input.component";
import Button from "carbon-components-react/es/components/Button";
import styles from "./vitals-biometrics-form.component.scss";
import { useTranslation } from "react-i18next";
import {
  useConfig,
  createErrorHandler,
  switchTo,
  useSessionUser,
} from "@openmrs/esm-framework";
import { Column, Grid, Row } from "carbon-components-react/es/components/Grid";
import { calculateBMI, isInNormalRange } from "./vitals-biometrics-form.utils";
import { savePatientVitals } from "../vitals-biometrics.resource";
import { useVitalsSignsConceptMetaData } from "./use-vitalsigns";
import { ConfigObject } from "../../config-schema";

interface VitalsAndBiometricFormProps {
  patientUuid: string;
  closeWorkspace(): void;
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

const VitalsAndBiometricForms: React.FC<VitalsAndBiometricFormProps> = ({
  patientUuid,
  closeWorkspace,
}) => {
  const session = useSessionUser();
  const config = useConfig() as ConfigObject;
  const { t } = useTranslation();
  const {
    vitalsSignsConceptMetadata,
    conceptsUnits,
  } = useVitalsSignsConceptMetaData();
  const biometricsUnitsSymbols = config.biometrics;
  const [patientVitalAndBiometrics, setPatientVitalAndBiometrics] = useState<
    PatientVitalAndBiometric
  >();
  const [patientBMI, setPatientBMI] = useState<number>();

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
    if (value === undefined || value === "") return true;
    return value >= 18.5 && value <= 24.9;
  };

  const savePatientVitalsAndBiometrics = () => {
    const ac = new AbortController();
    savePatientVitals(
      config.vitals.encounterTypeUuid,
      config.vitals.formUuid,
      config.concepts,
      patientUuid,
      patientVitalAndBiometrics,
      new Date(),
      ac,
      session.sessionLocation.uuid
    ).then((response) => {
      response.status === 201 && closeWorkspace();
      response.status !== 201 && createErrorHandler();
    });
    return () => ac.abort();
  };

  useEffect(() => {
    if (
      patientVitalAndBiometrics?.height &&
      patientVitalAndBiometrics?.weight
    ) {
      const calculatedBmi = calculateBMI(
        Number(patientVitalAndBiometrics.weight),
        Number(patientVitalAndBiometrics.height)
      );
      setPatientBMI(calculatedBmi);
    }
  }, [patientVitalAndBiometrics?.weight, patientVitalAndBiometrics?.height]);

  return (
    <Grid condensed className={styles.vitalsBiometricContainer}>
      <Row>
        <Column>
          <p className={styles.vitalsTitle}>Vitals</p>
        </Column>
      </Row>
      <Row>
        <Column>
          <VitalsBiometricInput
            title={t("bloodPressure", "Blood Pressure")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              event.target.name === "systolic"
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
                name: t("systolic", "systolic"),
                separator: "/",
                type: "text",
                value: patientVitalAndBiometrics?.systolicBloodPressure || "",
              },
              {
                name: t("diastolic", "diastolic"),
                type: "text",
                value: patientVitalAndBiometrics?.diastolicBloodPressure || "",
              },
            ]}
            unitSymbol={bloodPressureUnit}
            inputIsNormal={
              isInNormalRange(
                vitalsSignsConceptMetadata,
                config.concepts["systolicBloodPressureUuid"],
                patientVitalAndBiometrics?.systolicBloodPressure
              ) &&
              isInNormalRange(
                vitalsSignsConceptMetadata,
                config.concepts["diastolicBloodPressureUuid"],
                patientVitalAndBiometrics?.diastolicBloodPressure
              )
            }
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t("pulse", "Pulse")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                pulse: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("pulse", "pulse"),
                type: "text",
                value: patientVitalAndBiometrics?.pulse || "",
              },
            ]}
            unitSymbol={pulseUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts["pulseUuid"],
              patientVitalAndBiometrics?.pulse
            )}
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t("spo2", "Sp02")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                oxygenSaturation: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("oxygenSaturation", "Oxygen Saturation"),
                type: "text",
                value: patientVitalAndBiometrics?.oxygenSaturation || "",
              },
            ]}
            unitSymbol={oxygenSaturationUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts["oxygenSaturationUuid"],
              patientVitalAndBiometrics?.oxygenSaturation
            )}
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t("respiratoryRate", "Respiration Rate")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                respiratoryRate: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("respiratoryRate", "Respiration Rate"),
                type: "text",
                value: patientVitalAndBiometrics?.respiratoryRate || "",
              },
            ]}
            unitSymbol={respiratoryRateUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts["respiratoryRateUuid"],
              patientVitalAndBiometrics?.respiratoryRate
            )}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <VitalsBiometricInput
            title={t("temp", "Temp")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                temperature: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("temperature", "Temperature"),
                type: "text",
                value: patientVitalAndBiometrics?.temperature || "",
              },
            ]}
            unitSymbol={temperatureUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts["temperatureUuid"],
              patientVitalAndBiometrics?.temperature
            )}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <VitalsBiometricInput
            title={t("notes", "Notes")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                generalPatientNote: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("notes", "Notes"),
                type: "textArea",
                value: patientVitalAndBiometrics?.generalPatientNote,
              },
            ]}
            textFieldWidth="26.375rem"
            placeholder="Type any additional notes here"
            inputIsNormal={true}
          />
        </Column>
      </Row>

      <Row>
        <Column>
          <p className={styles.vitalsTitle}>Biometrics</p>
        </Column>
      </Row>
      <Row>
        <Column>
          <VitalsBiometricInput
            title={t("weight", "Weight")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                weight: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("weight", "Weight"),
                type: "text",
                value: patientVitalAndBiometrics?.weight || "",
              },
            ]}
            unitSymbol={weightUnit}
            inputIsNormal={true}
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t("height", "Height")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                height: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("height", "Height"),
                type: "text",
                value: patientVitalAndBiometrics?.height || "",
              },
            ]}
            unitSymbol={heightUnit}
            inputIsNormal={true}
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t("bmiCalc", "BMI(calc.)")}
            onInputChange={() => {}}
            textFields={[
              {
                name: t("bmi", "bmi"),
                type: "text",
                value: patientBMI || "",
              },
            ]}
            unitSymbol={biometricsUnitsSymbols["bmiUnit"]}
            disabled={true}
            inputIsNormal={isBMIInNormalRange(patientBMI)}
          />
        </Column>
        <Column>
          <VitalsBiometricInput
            title={t("muac", "MUAC")}
            onInputChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPatientVitalAndBiometrics({
                ...patientVitalAndBiometrics,
                midUpperArmCircumference: event.target.value,
              });
            }}
            textFields={[
              {
                name: t("muac", "muac"),
                type: "text",
                value:
                  patientVitalAndBiometrics?.midUpperArmCircumference || "",
              },
            ]}
            unitSymbol={midUpperArmCircumferenceUnit}
            inputIsNormal={isInNormalRange(
              vitalsSignsConceptMetadata,
              config.concepts["midUpperArmCircumferenceUuid"],
              patientVitalAndBiometrics?.midUpperArmCircumference
            )}
          />
        </Column>
      </Row>
      <Row>
        <Column>
          <Button
            onClick={closeWorkspace}
            className={styles.vitalsButton}
            kind="secondary"
          >
            {t("cancel", "Cancel")}
          </Button>
          <Button
            onClick={savePatientVitalsAndBiometrics}
            className={styles.vitalsButton}
            kind="primary"
          >
            {t("signandsave", "Sign & Save")}
          </Button>
        </Column>
      </Row>
    </Grid>
  );
};

export default VitalsAndBiometricForms;
