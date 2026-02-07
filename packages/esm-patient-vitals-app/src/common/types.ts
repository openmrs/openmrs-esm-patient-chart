import type { OpenmrsResource } from '@openmrs/esm-framework';

export interface FHIRObservationResource {
  resourceType: string;
  id: string;
  status: string;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  subject: {
    reference: string;
  };
  encounter?: {
    reference: string;
  };
  effectiveDateTime: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  interpretation?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  referenceRange?: Array<{
    low?: {
      value: number;
    };
    high?: {
      value: number;
    };
    type?: {
      coding: Array<{
        system: string;
        code: string;
      }>;
    };
  }>;
}

export interface FHIRSearchBundleResponse {
  data: {
    entry: Array<{
      resource: FHIRObservationResource;
    }>;
    link: Array<{
      relation: string;
      url: string;
    }>;
    total: number;
  };
}

export interface MappedVitals {
  code: string;
  encounterId: string;
  interpretation: string;
  recordedDate: string;
  value: number;
  referenceRanges: {
    uuid: string;
    display: string;
    hiNormal: number | null;
    hiAbsolute: number | null;
    hiCritical: number | null;
    lowNormal: number | null;
    lowAbsolute: number | null;
    lowCritical: number | null;
    units: string | null;
  };
}

export interface PatientVitalsAndBiometrics {
  id: string;
  date: string;
  bmi?: number;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  height?: number;
  weight?: number;
  muac?: number;
  // Added these fields to fix the 'does not exist' errors
  bloodPressureRenderInterpretation?: string;
  pulseRenderInterpretation?: string;
  temperatureRenderInterpretation?: string;
  spo2RenderInterpretation?: string;
  respiratoryRateRenderInterpretation?: string;
  [key: string]: any;
}

export interface VitalsResponse {
  entry: Array<{
    resource: FHIRObservationResource;
  }>;
  link: Array<{
    relation: string;
    url: string;
  }>;
  total: number;
}
