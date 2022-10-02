import styles from './result-panel.scss';
import { Concept, ConceptMeta, FHIRObservationResource, observationInterpretation } from './types';
import { OBSERVATION_INTERPRETATION } from '@openmrs/esm-patient-common-lib';

export const getConceptUuid = (obs: FHIRObservationResource) => obs?.code.coding[0].code;

export const getClass = (interpretation: OBSERVATION_INTERPRETATION) => {
  switch (interpretation) {
    case 'OFF_SCALE_HIGH':
      return styles['off-scale-high'];

    case 'CRITICALLY_HIGH':
      return styles['critically-high'];

    case 'HIGH':
      return styles['high'];

    case 'OFF_SCALE_LOW':
      return styles['off-scale-low'];

    case 'CRITICALLY_LOW':
      return styles['critically-low'];

    case 'LOW':
      return styles['low'];

    case 'NORMAL':
    default:
      return '';
  }
};

export function exist(...args: any[]): boolean {
  for (const y of args) {
    if (y === null || y === undefined) {
      return false;
    }
  }

  return true;
}

export const assessValue: (any) => (value: number) => OBSERVATION_INTERPRETATION =
  (meta) =>
  (value: number): observationInterpretation => {
    if (exist(meta.hiAbsolute) && value > meta.hiAbsolute) {
      return observationInterpretation.OFF_SCALE_HIGH;
    }

    if (exist(meta.hiCritical) && value > meta.hiCritical) {
      return observationInterpretation.CRITICALLY_HIGH;
    }

    if (exist(meta.hiNormal) && value > meta.hiNormal) {
      return observationInterpretation.HIGH;
    }

    if (exist(meta.lowAbsolute) && value < meta.lowAbsolute) {
      return observationInterpretation.OFF_SCALE_LOW;
    }

    if (exist(meta.lowCritical) && value < meta.lowCritical) {
      return observationInterpretation.CRITICALLY_LOW;
    }

    if (exist(meta.lowNormal) && value < meta.lowNormal) {
      return observationInterpretation.LOW;
    }

    return observationInterpretation.NORMAL;
  };

export function extractMetaInformation(concept: Concept): ConceptMeta {
  const { display, hiAbsolute, hiCritical, hiNormal, lowAbsolute, lowCritical, lowNormal, units } = concept;

  let range = null;
  if (exist(hiNormal, lowNormal)) {
    range = `${lowNormal} – ${hiNormal}`;
  }

  const getInterpretation = assessValue({
    hiAbsolute,
    hiCritical,
    hiNormal,
    lowAbsolute,
    lowCritical,
    lowNormal,
    units,
    range,
  });

  return {
    display,
    hiAbsolute,
    hiCritical,
    hiNormal,
    lowAbsolute,
    lowCritical,
    lowNormal,
    units,
    range,
    getInterpretation,
  };
}
