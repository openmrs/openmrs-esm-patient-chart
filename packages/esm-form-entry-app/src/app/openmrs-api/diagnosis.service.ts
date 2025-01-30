import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { debounceTime } from 'rxjs';

import { Concept, DiagnosisResult } from '../types';
import { DiagnosisConfig } from '../types';
import { ConceptResourceService } from './concept-resource.service';

type ConceptReferenceTerm = Concept['mappings'][number]['conceptReferenceTerm'];

const DIAGNOSIS_CONCEPT_CLASS_UUID = '8d4918b0-c2cc-11de-8d13-0010c6dffd0f';
const CONCEPT_RESPONSE_CUSTOM_REPRESENTATION =
  'custom:(uuid,display,name,conceptClass:(uuid,display),set,mappings:(uuid,display,conceptReferenceTerm:(uuid,display,code,name,conceptSource:full)))';

@Injectable()
export class DiagnosisResourceService {
  constructor(private readonly conceptResourceService: ConceptResourceService) {}

  /**
   * Searches for diagnosis concepts with optional source filtering
   * @param searchText - Search query for diagnosis names
   * @param config - Optional configuration:
   *                 - conceptSourceUuid: Filter by concepts mapped to this source UUID
   * @returns Observable of diagnosis results in { value: uuid, label: display } format
   */
  public findDiagnoses(searchText: string, config?: DiagnosisConfig) {
    return this.conceptResourceService.searchConcept(searchText, true, CONCEPT_RESPONSE_CUSTOM_REPRESENTATION).pipe(
      debounceTime(500),
      catchError((error: Error) => {
        console.error('Diagnosis search failed:', error);
        return of([]);
      }),
      map((concepts: Array<Concept>) => this.processConcepts(concepts, config)),
    );
  }

  private processConcepts(concepts: Array<Concept>, config?: DiagnosisConfig): Array<DiagnosisResult> {
    return concepts
      .filter(this.isDiagnosisConcept)
      .filter((concept) => this.matchesConceptSource(concept, config))
      .map((concept) => this.mapDiagnosis(concept, config))
      .filter((result): result is DiagnosisResult => !!result);
  }

  private isDiagnosisConcept(concept: Concept): boolean {
    return concept.conceptClass?.uuid === DIAGNOSIS_CONCEPT_CLASS_UUID;
  }

  private matchesConceptSource(concept: Concept, config?: DiagnosisConfig): boolean {
    if (!config?.conceptSourceUuid) return true;

    return (
      concept.mappings?.some(
        (mapping) => mapping?.conceptReferenceTerm?.conceptSource?.uuid === config.conceptSourceUuid,
      ) ?? false
    );
  }

  private mapDiagnosis(concept, config) {
    if (!concept?.uuid) {
      return undefined;
    }

    const baseLabel = concept.name?.display ?? 'Unnamed Concept';

    // Get reference term if source UUID is provided
    const referenceTerm = config?.conceptSourceUuid
      ? this.getSourceDisplay(concept, config.conceptSourceUuid)
      : undefined;

    const label = referenceTerm ? `${referenceTerm.code} - ${referenceTerm.name ?? baseLabel}` : baseLabel;

    return {
      value: concept.uuid,
      label: label.trim(),
    };
  }

  private getSourceDisplay(concept, sourceUuid): ConceptReferenceTerm | undefined {
    if (!sourceUuid || !concept.mappings?.length) {
      return undefined;
    }

    return concept.mappings.find((mapping) => mapping?.conceptReferenceTerm?.conceptSource?.uuid === sourceUuid)
      ?.conceptReferenceTerm;
  }
}
