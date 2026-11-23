import { describe, expect, it } from 'vitest';
import { extractErrorMessage } from './extractErrorMessage';

function restError(responseBody: unknown) {
  return Object.assign(new Error('Server responded with 400 () for url /openmrs/ws/rest/v1/visit'), { responseBody });
}

describe('extractErrorMessage', () => {
  it('returns global and field validation messages, joined with line breaks', () => {
    const error = restError({
      error: {
        message: 'Invalid Submission',
        globalErrors: [{ code: 'patient.dead', message: 'The patient has died' }],
        fieldErrors: {
          dateEnrolled: [{ code: 'error.date.future', message: 'Date enrolled cannot be in the future' }],
          location: [{ code: 'error.null', message: 'Location is required' }],
        },
      },
    });

    expect(extractErrorMessage(error)).toBe(
      'The patient has died\nDate enrolled cannot be in the future\nLocation is required',
    );
  });

  it('joins validation messages with the given separator', () => {
    const error = restError({
      error: {
        message: 'Invalid Submission',
        fieldErrors: {
          dateEnrolled: [{ code: 'error.date.future', message: 'Date enrolled cannot be in the future' }],
          location: [{ code: 'error.null', message: 'Location is required' }],
        },
      },
    });

    expect(extractErrorMessage(error, undefined, ', ')).toBe(
      'Date enrolled cannot be in the future, Location is required',
    );
  });

  it("returns the server's error message when there are no validation messages", () => {
    const error = restError({ error: { message: 'Patient is already enrolled in this program', globalErrors: [] } });

    expect(extractErrorMessage(error)).toBe('Patient is already enrolled in this program');
  });

  it('returns a plain-text response body as is', () => {
    expect(extractErrorMessage(restError('Visit start date is after the stop date'))).toBe(
      'Visit start date is after the stop date',
    );
  });

  it("returns the error's own message when the server gives no reason", () => {
    expect(extractErrorMessage(restError({}))).toBe('Server responded with 400 () for url /openmrs/ws/rest/v1/visit');
    expect(extractErrorMessage(new Error('Network request failed'))).toBe('Network request failed');
  });

  it('returns the fallback instead of the error message when the server gives no reason', () => {
    expect(extractErrorMessage(restError({}), 'Please try again')).toBe('Please try again');
    expect(extractErrorMessage(restError({ error: { message: 'Server reason' } }), 'Please try again')).toBe(
      'Server reason',
    );
    expect(extractErrorMessage(restError('Plain-text server reason'), 'Please try again')).toBe(
      'Plain-text server reason',
    );
  });

  it("returns the error's own message instead of an HTML error page", () => {
    expect(extractErrorMessage(restError('<html><body><h1>502 Bad Gateway</h1></body></html>'))).toBe(
      'Server responded with 400 () for url /openmrs/ws/rest/v1/visit',
    );
  });

  it('returns undefined when there is no message at all', () => {
    expect(extractErrorMessage(undefined)).toBeUndefined();
    expect(extractErrorMessage({})).toBeUndefined();
  });
});
