import type { FetchResponse, FHIRResource } from '@openmrs/esm-framework';

type ReferenceRangeValue = number | null | undefined;

export type FHIRSearchBundleResponse = FetchResponse<{
  entry: Array<FHIRResource>;
  link: Array<{ relation: string; url: string }>;
}>;

export interface ObsReferenceRanges {
  hiAbsolute: ReferenceRangeValue;
  hiCritical: ReferenceRangeValue;
  hiNormal: ReferenceRangeValue;
  lowNormal: ReferenceRangeValue;
  lowCritical: ReferenceRangeValue;
  lowAbsolute: ReferenceRangeValue;
}

export type ObservationInterpretation = 'critically_low' | 'critically_high' | 'high' | 'low' | 'normal';

export type MappedVitals = {
  code: string;
  interpretation: string;
  recordedDate: string | Date;
  value: number;
  encounterId: string;
};

export interface FHIRObservationResource {
  resourceType: string;
  id: string;
  category: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      code: string;
      display: string;
    }>;
    text: string;
  };
  encounter?: {
    reference: string;
    type: string;
  };
  effectiveDateTime: string;
  issued: string;
  valueString?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueCodeableConcept?: {
    coding: [
      {
        code: string;
        display: string;
      },
    ];
    text: string;
  };
  referenceRange: Array<{
    low?: {
      value: number;
    };
    high?: {
      value: number;
    };
    type: {
      coding: Array<{
        system: string;
        code: string;
      }>;
    };
  }>;
  hasMember?: Array<{
    reference: string;
  }>;
}

export interface PatientVitalsAndBiometrics {
  id: string;
  date: string;
  systolic?: number;
  diastolic?: number;
  bloodPressureRenderInterpretation?: ObservationInterpretation;
  pulse?: number;
  pulseRenderInterpretation?: ObservationInterpretation;
  temperature?: number;
  temperatureRenderInterpretation?: ObservationInterpretation;
  spo2?: number;
  spo2RenderInterpretation?: ObservationInterpretation;
  height?: number;
  weight?: number;
  bmi?: number | null;
  respiratoryRate?: number;
  respiratoryRateRenderInterpretation?: ObservationInterpretation;
  muac?: number;
}

export interface VitalsResponse {
  entry: Array<{
    resource: FHIRObservationResource;
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  resourceType: string;
  total: number;
  type: string;
}
