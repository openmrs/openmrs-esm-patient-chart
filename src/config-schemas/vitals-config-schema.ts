import { validators } from "@openmrs/esm-module-config";

export const vitalsConfigSchema = {
  triageFormConfig: {
    formUuid: {
      validators: [validators.isString],
      default: "a000cb34-9ec1-4344-a1c8-f692232f6edd"
    },
    encounterTypeUuid: {
      validators: [validators.isString],
      default: "67a71486-1a54-468f-ac3e-7091a9a79584"
    },
    display: {
      validators: [validators.isString],
      default:
        "The form and encounter metadata used to capture triage information"
    }
  },
  vitalsConcepts: {
    SYSTOLIC_BLOOD_PRESSURE_CONCEPT: {
      validators: [validators.isString],
      default: "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    DIASTOLIC_BLOOD_PRESSURE_CONCEPT: {
      validators: [validators.isString],
      default: "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    PULSE_CONCEPT: {
      validators: [validators.isString],
      default: "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    TEMPERATURE_CONCEPT: {
      validators: [validators.isString],
      default: "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    OXYGENATION_CONCEPT: {
      validators: [validators.isString],
      default: "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    HEIGHT_CONCEPT: {
      validators: [validators.isString],
      default: "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    WEIGHT_CONCEPT: {
      validators: [validators.isString],
      default: "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
  }
};
