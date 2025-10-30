import { Injectable } from '@angular/core';
import { AfeFormArray, AfeFormControl, AfeFormGroup, Form } from '@openmrs/ngx-formentry';
import { type Questions as Question } from '../types';

@Injectable()
export class FormPrepopulationService {
  prepopulateForm(form: Form): void {
    const questionsToPrepopulate = this.collectQuestionsForPrepopulation(form);
    const obsMap = this.createObservationMap(form);
    const controlMap = this.createFormControlMap(form, questionsToPrepopulate);

    questionsToPrepopulate.forEach((question) => {
      const control = controlMap.get(question.id);
      if (control) {
        const conceptId = question.questionOptions?.concept;
        if (typeof conceptId === 'string') {
          const value = obsMap.get(conceptId);
          if (value) {
            control.setValue(value);
          }
        }
      }
    });
  }

  private collectQuestionsForPrepopulation(form: Form): Set<Question> {
    const questionsSet = new Set<Question>();
    for (const page of form.schema.pages) {
      if (!page.sections || !Array.isArray(page.sections)) {
        continue;
      }
      for (const section of page.sections) {
        this.extractQuestionsWithRecentValues(section.questions, questionsSet);
      }
    }
    return questionsSet;
  }

  private extractQuestionsWithRecentValues(questions: Question[], targetSet: Set<Question>): void {
    if (!questions || !Array.isArray(questions)) {
      return;
    }
    
    for (const question of questions) {
      if (this.shouldPrepopulate(question)) {
        if (this.hasValidConceptIdentifier(question)) {
          targetSet.add(question);
        } else if (Array.isArray(question.questions)) {
          this.extractQuestionsWithRecentValues(question.questions, targetSet);
        }
      }
    }
  }

  private shouldPrepopulate(question: Question): boolean {
    const options = question.questionOptions;
    const useRecent = options?.useMostRecentValue;
    const autoPopulate = options?.autoPopulateWithMostRecentValue ?? false;
    return autoPopulate && (useRecent === 'true' || (typeof useRecent === 'boolean' && useRecent));
  }

  private hasValidConceptIdentifier(question: Question): boolean {
    return typeof question.concept === 'string' || typeof question.questionOptions?.concept === 'string';
  }

  private createObservationMap(form: Form): Map<string, unknown> {
    const obs = form.dataSourcesContainer?.dataSources?.['rawPrevObs']?.['obs'] ?? [];
    const map = new Map<string, unknown>();
    obs.forEach((ob) => map.set(ob.concept.uuid, ob.value));
    return map;
  }

  private createFormControlMap(
    form: Form,
    questions: Set<Question>,
  ): Map<string, AfeFormControl | AfeFormArray | AfeFormGroup> {
    const map = new Map<string, AfeFormControl | AfeFormArray | AfeFormGroup>();
    questions.forEach((question) => {
      const controls = form.searchNodeByQuestionId(question.id);
      if (controls?.length) {
        map.set(question.id, controls[0].control);
      }
    });
    return map;
  }
}
