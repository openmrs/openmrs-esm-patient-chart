import { describe, expect, it } from 'vitest';
import { getConditionErrorReason } from './conditions.resource';

function operationOutcome(...diagnostics: Array<unknown>) {
  return {
    resourceType: 'OperationOutcome',
    issue: diagnostics.map((d) => ({ severity: 'error', code: 'processing', diagnostics: d })),
  };
}

const privilegeDiagnostics =
  'HAPI-0389: Failed to call access method: org.openmrs.api.APIAuthenticationException: Privileges required: Edit Conditions';

describe('getConditionErrorReason', () => {
  it('returns the reason from a FHIR privilege error without the HAPI and Java prefixes', () => {
    const reason = getConditionErrorReason(operationOutcome(privilegeDiagnostics));

    expect(reason).toBe('Privileges required: Edit Conditions');
  });

  it('returns FHIR diagnostics that have no prefixes unchanged', () => {
    const diagnostics = 'Resource of type Condition with ID abc is not known';

    expect(getConditionErrorReason(operationOutcome(diagnostics))).toBe(diagnostics);
  });

  it.each([
    ['diagnostics that are only a prefix', operationOutcome('HAPI-0389: ')],
    ['an empty issue list', operationOutcome()],
    ['non-string diagnostics', operationOutcome({ text: 'not a string' })],
  ])('returns undefined for a FHIR body with %s', (_, body) => {
    expect(getConditionErrorReason(body)).toBeUndefined();
  });

  it('returns the message from a REST error body', () => {
    const body = { error: { message: 'Privileges required: Edit Conditions' } };

    expect(getConditionErrorReason(body)).toBe('Privileges required: Edit Conditions');
  });

  it.each([
    ['an empty string', ''],
    ['a whitespace-only string', '   '],
    ['a non-string value', { detail: 'not a string' }],
  ])('returns undefined for a REST error message that is %s', (_, message) => {
    expect(getConditionErrorReason({ error: { message } })).toBeUndefined();
  });

  it.each([
    ['an HTML string body', '<!doctype html><html><head><title>HTTP Status 401 – Unauthorized</title></head></html>'],
    ['a null body', null],
  ])('returns undefined for %s', (_, body) => {
    expect(getConditionErrorReason(body)).toBeUndefined();
  });
});
