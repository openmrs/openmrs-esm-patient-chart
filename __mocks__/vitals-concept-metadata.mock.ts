import { mockVitalsSignsConcepts } from './vitals-and-biometrics.mock';

const mockConceptData = mockVitalsSignsConcepts.data.results[0].setMembers;

export const mockConceptUnits = new Map<string, string>(
  mockConceptData.map((concept) => [concept.uuid, concept.units]),
);

export const mockVitalsConceptMetadata = {
  data: mockConceptUnits,
  error: null,
  isLoading: false,
  conceptMetadata: mockConceptData,
  conceptRanges: mockConceptData.map((concept) => ({
    uuid: concept.uuid,
    display: concept.display,
    hiNormal: concept.hiNormal ?? null,
    hiAbsolute: concept.hiAbsolute ?? null,
    hiCritical: concept.hiCritical ?? null,
    lowNormal: concept.lowNormal ?? null,
    lowAbsolute: concept.lowAbsolute ?? null,
    lowCritical: concept.lowCritical ?? null,
    units: concept.units ?? null,
  })),
  conceptRangeMap: new Map(
    mockConceptData.map((concept) => [
      concept.uuid,
      {
        uuid: concept.uuid,
        display: concept.display,
        hiNormal: concept.hiNormal ?? null,
        hiAbsolute: concept.hiAbsolute ?? null,
        hiCritical: concept.hiCritical ?? null,
        lowNormal: concept.lowNormal ?? null,
        lowAbsolute: concept.lowAbsolute ?? null,
        lowCritical: concept.lowCritical ?? null,
        units: concept.units ?? null,
      },
    ]),
  ),
};

export const mockConceptRanges = new Map<string, { lowAbsolute: number | null; highAbsolute: number | null }>(
  mockConceptData.map((concept) => [
    concept.uuid,
    { lowAbsolute: concept.lowAbsolute ?? null, highAbsolute: concept.hiAbsolute ?? null },
  ]),
);
