import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

export type VisitSummaryPdfErrorType = 'notAuthorized' | 'visitNotFound' | 'generationFailed' | 'network';

/**
 * Fetches the visit summary PDF for a visit as a Blob. Rejects with the original
 * fetch error on failure; use {@link getVisitSummaryPdfErrorType} to classify it.
 * If the request itself succeeds but the response body cannot be read as a Blob,
 * rejects with an error marked `isBlobReadError` so the classifier can distinguish
 * it from a request that never reached the server.
 */
export async function fetchVisitSummaryPdf(visitUuid: string, abortController?: AbortController): Promise<Blob> {
  const response = await openmrsFetch(`${restBaseUrl}/patientdocuments/visitSummary?visitUuid=${visitUuid}`, {
    headers: { Accept: 'application/pdf' },
    signal: abortController?.signal,
  });
  try {
    return await response.blob();
  } catch (error) {
    throw Object.assign(new Error('Failed to read the visit summary PDF response body'), {
      isBlobReadError: true,
      cause: error,
    });
  }
}

/**
 * Maps a rejection from {@link fetchVisitSummaryPdf} onto one of the four failure
 * classes the UI must surface distinctly: 403 (missing the visit summary privilege),
 * 404 (visit unknown to the server), any other HTTP status or an unreadable response
 * body (server-side generation failure), or no response at all (network/offline).
 */
export function getVisitSummaryPdfErrorType(error: unknown): VisitSummaryPdfErrorType {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 403) {
    return 'notAuthorized';
  }
  if (status === 404) {
    return 'visitNotFound';
  }
  if (typeof status === 'number') {
    return 'generationFailed';
  }
  if ((error as { isBlobReadError?: boolean })?.isBlobReadError) {
    return 'generationFailed';
  }
  return 'network';
}
