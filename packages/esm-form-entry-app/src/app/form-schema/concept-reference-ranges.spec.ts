import { FormSchema, Questions } from '../types';
import { getNumericQuestionConcepts } from './concept-reference-ranges';

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
        { id: 'alsoStale', type: 'obs', questionOptions: { rendering: 'number', concept: 'stale-uuid' } as any },
        { id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'CIEL:5089' } as any },
      ],
      {
        'CIEL:5089': { uuid: 'weight-uuid', display: 'Weight (kg)' },
      },
    );

    expect(getNumericQuestionConcepts(schema)).toEqual(['weight-uuid']);
  });

  it('keeps a question whose concept is a UUID the schema resolved', () => {
    const schema = buildSchema(
      [{ id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'weight-uuid' } as any }],
      { 'weight-uuid': { uuid: 'weight-uuid', display: 'Weight (kg)' } },
    );

    expect(getNumericQuestionConcepts(schema)).toEqual(['weight-uuid']);
  });

  it('falls back to the concept of the question when the schema carries no concept references', () => {
    const schema = buildSchema([
      { id: 'weight', type: 'obs', questionOptions: { rendering: 'decimal', concept: 'weight-uuid' } as any },
    ]);

    expect(getNumericQuestionConcepts(schema)).toEqual(['weight-uuid']);
  });
});
