import { Type } from "@openmrs/esm-framework";
import vitalsConfigSchema, {
  VitalsConfigObject
} from "./vitals/vitals-config-schema";
import biometricsConfigSchema, {
  BiometricsConfigObject
} from "./vitals/biometrics-config-schema";

export const configSchema = {
  concepts: {
    systolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: "5085AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    diastolicBloodPressureUuid: {
      _type: Type.ConceptUuid,
      _default: "5086AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    pulseUuid: {
      _type: Type.ConceptUuid,
      _default: "5087AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    temperatureUuid: {
      _type: Type.ConceptUuid,
      _default: "5088AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    oxygenSaturationUuid: {
      _type: Type.ConceptUuid,
      _default: "5092AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    heightUuid: {
      _type: Type.ConceptUuid,
      _default: "5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    weightUuid: {
      _type: Type.ConceptUuid,
      _default: "5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    },
    respiratoryRateUuid: {
      _type: Type.ConceptUuid,
      _default: "5242AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }
  },
  vitals: vitalsConfigSchema,
  biometrics: biometricsConfigSchema
};

export interface ConfigObject {
  concepts: {
    systolicBloodPressureUuid: string;
    diastolicBloodPressureUuid: string;
    pulseUuid: string;
    temperatureUuid: string;
    oxygenSaturationUuid: string;
    heightUuid: string;
    weightUuid: string;
    respiratoryRateUuid: string;
  };
  vitals: VitalsConfigObject;
  biometrics: BiometricsConfigObject;
}
