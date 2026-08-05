import { ConceptReferenceRange, FormSchema, Questions } from '../types';
import { applyConceptReferenceRanges, getNumericQuestionConcepts } from './concept-reference-ranges';

function buildSchema(questions: Array<Partial<Questions>>, conceptReferences?: FormSchema['conceptReferences']) {
  return {
    uuid: 'form-uuid',
    display: 'Test form',
    conceptReferences,
    pages: [
      {
        label: 'Page',
        sections: [
          {
            label: 'Section',
            isExpanded: true,
            questions: questions as Array<Questions>,
          },
        ],
      },
    ],
  } as FormSchema;
}

function buildReferenceRange(concept: string, referenceRange: Partial<ConceptReferenceRange>) {
  return new Map<string, ConceptReferenceRange>([
    [concept, { uuid: `${concept}-range`, concept, ...referenceRange } as ConceptReferenceRange],
  ]);
}

describe('getNumericQuestionConcepts', () => {
  it('returns the concepts of the numeric questions only', () => {
    const schema = buildSchema([
      { id: 'temperature', type: 'obs', questionOptions: { rendering: 'number', concept: 'temperature-uuid' } as any },
      { id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'weight-uuid' } as any },
      { id: 'notes', type: 'obs', questionOptions: { rendering: 'text', concept: 'notes-uuid' } as any },
      { id: 'nameless', type: 'obs', questionOptions: { rendering: 'number' } as any },
    ]);

    expect(getNumericQuestionConcepts(schema)).toEqual(['temperature-uuid', 'weight-uuid']);
  });

  it('collects nested questions and deduplicates concepts', () => {
    const schema = buildSchema([
      {
        id: 'group',
        type: 'obsGroup',
        questionOptions: { rendering: 'group', concept: 'group-uuid' } as any,
        questions: [
          { id: 'pulse', type: 'obs', questionOptions: { rendering: 'number', concept: 'pulse-uuid' } } as Questions,
        ],
      },
      { id: 'pulseAgain', type: 'obs', questionOptions: { rendering: 'number', concept: 'pulse-uuid' } as any },
    ]);

    expect(getNumericQuestionConcepts(schema)).toEqual(['pulse-uuid']);
  });

  it('returns an empty list for a schema without pages', () => {
    expect(getNumericQuestionConcepts({} as FormSchema)).toEqual([]);
  });

  it('resolves concept references and deduplicates the resolved concepts', () => {
    const schema = buildSchema(
      [
        { id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'CIEL:5089' } as any },
        { id: 'weightAgain', type: 'obs', questionOptions: { rendering: 'number', concept: 'weight-uuid' } as any },
      ],
      { 'CIEL:5089': { uuid: 'weight-uuid', display: 'Weight (kg)' } },
    );

    expect(getNumericQuestionConcepts(schema)).toEqual(['weight-uuid']);
  });

  it('leaves out references which the schema tells us do not resolve', () => {
    const schema = buildSchema(
      [
        { id: 'stale', type: 'obs', questionOptions: { rendering: 'number', concept: 'CIEL:00000' } as any },
        { id: 'alsoStale', type: 'obs', questionOptions: { rendering: 'number', concept: 'CIEL:11111' } as any },
        { id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'CIEL:5089' } as any },
      ],
      {
        'CIEL:00000': { uuid: null, display: null },
        'CIEL:11111': {},
        'CIEL:5089': { uuid: 'weight-uuid', display: 'Weight (kg)' },
      },
    );

    expect(getNumericQuestionConcepts(schema)).toEqual(['weight-uuid']);
  });
});

describe('applyConceptReferenceRanges', () => {
  it('applies the absolute bounds of the reference range to a numeric question', () => {
    const schema = buildSchema([
      { id: 'temperature', type: 'obs', questionOptions: { rendering: 'number', concept: 'temperature-uuid' } as any },
    ]);

    applyConceptReferenceRanges(schema, buildReferenceRange('temperature-uuid', { lowAbsolute: 25, hiAbsolute: 43 }));

    expect(schema.pages[0].sections[0].questions[0].questionOptions).toEqual(
      jasmine.objectContaining({ min: '25', max: '43' }),
    );
  });

  it('applies a lower bound of zero, which the schema expresses as a string', () => {
    const schema = buildSchema([
      { id: 'pulse', type: 'obs', questionOptions: { rendering: 'number', concept: 'pulse-uuid' } as any },
    ]);

    applyConceptReferenceRanges(schema, buildReferenceRange('pulse-uuid', { lowAbsolute: 0, hiAbsolute: 230 }));

    expect(schema.pages[0].sections[0].questions[0].questionOptions).toEqual(
      jasmine.objectContaining({ min: '0', max: '230' }),
    );
  });

  it('keeps the stricter of the schema bound and the reference range bound', () => {
    const schema = buildSchema([
      {
        id: 'temperature',
        type: 'obs',
        questionOptions: { rendering: 'number', concept: 'temperature-uuid', min: '30', max: '50' } as any,
      },
    ]);

    applyConceptReferenceRanges(schema, buildReferenceRange('temperature-uuid', { lowAbsolute: 25, hiAbsolute: 43 }));

    expect(schema.pages[0].sections[0].questions[0].questionOptions).toEqual(
      jasmine.objectContaining({ min: '30', max: '43' }),
    );
  });

  it('resolves questions which refer to their concept by concept reference', () => {
    const schema = buildSchema(
      [{ id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'CIEL:5089' } as any }],
      { 'CIEL:5089': { uuid: 'weight-uuid', display: 'Weight (kg)' } },
    );

    applyConceptReferenceRanges(schema, buildReferenceRange('weight-uuid', { lowAbsolute: 0, hiAbsolute: 250 }));

    expect(schema.pages[0].sections[0].questions[0].questionOptions).toEqual(
      jasmine.objectContaining({ min: '0', max: '250' }),
    );
  });

  it('ignores the normal and critical bounds', () => {
    const schema = buildSchema([
      { id: 'temperature', type: 'obs', questionOptions: { rendering: 'number', concept: 'temperature-uuid' } as any },
    ]);

    applyConceptReferenceRanges(
      schema,
      buildReferenceRange('temperature-uuid', {
        lowNormal: 36,
        hiNormal: 37.5,
        lowCritical: 35,
        hiCritical: 40,
        lowAbsolute: 25,
        hiAbsolute: 43,
      }),
    );

    expect(schema.pages[0].sections[0].questions[0].questionOptions).toEqual(
      jasmine.objectContaining({ min: '25', max: '43' }),
    );
  });

  it('leaves a question untouched when only one absolute bound can be determined', () => {
    const questionOptions = { rendering: 'number', concept: 'temperature-uuid' } as any;
    const schema = buildSchema([{ id: 'temperature', type: 'obs', questionOptions }]);

    applyConceptReferenceRanges(schema, buildReferenceRange('temperature-uuid', { hiAbsolute: 43 }));

    expect(questionOptions.min).toBeUndefined();
    expect(questionOptions.max).toBeUndefined();
  });

  it('leaves questions whose concept reference does not resolve untouched', () => {
    const questionOptions = { rendering: 'number', concept: 'CIEL:00000' } as any;
    const schema = buildSchema([{ id: 'stale', type: 'obs', questionOptions }], {
      'CIEL:00000': { uuid: null, display: null },
    });

    applyConceptReferenceRanges(schema, buildReferenceRange('CIEL:00000', { lowAbsolute: 0, hiAbsolute: 230 }));

    expect(questionOptions.min).toBeUndefined();
    expect(questionOptions.max).toBeUndefined();
  });

  it('leaves questions without a matching reference range untouched', () => {
    const questionOptions = { rendering: 'number', concept: 'temperature-uuid' } as any;
    const schema = buildSchema([{ id: 'temperature', type: 'obs', questionOptions }]);

    applyConceptReferenceRanges(schema, buildReferenceRange('pulse-uuid', { lowAbsolute: 0, hiAbsolute: 230 }));

    expect(questionOptions.min).toBeUndefined();
    expect(questionOptions.max).toBeUndefined();
  });

  it('does nothing when there are no reference ranges', () => {
    const questionOptions = { rendering: 'number', concept: 'temperature-uuid', max: '50' } as any;
    const schema = buildSchema([{ id: 'temperature', type: 'obs', questionOptions }]);

    applyConceptReferenceRanges(schema, new Map());
    applyConceptReferenceRanges(schema, undefined);

    expect(questionOptions.min).toBeUndefined();
    expect(questionOptions.max).toBe('50');
  });
});
