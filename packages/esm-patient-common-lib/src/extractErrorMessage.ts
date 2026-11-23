type RestErrorEntry = { code?: string; message?: string };

type RestErrorBody = {
  error?: {
    message?: string;
    globalErrors?: Array<RestErrorEntry>;
    fieldErrors?: Record<string, Array<RestErrorEntry>>;
  };
};

/**
 * Returns a message to show the user for an error thrown by an OpenMRS REST call.
 *
 * Validation errors from the server are joined with commas, global errors first, then field errors.
 * If there are none, the server's top-level error message is used, then a plain-text response body.
 * If the server gives no reason, `fallback` is returned when given, else the error's own message.
 */
export function extractErrorMessage(error: unknown, fallback?: string): string | undefined {
  const responseBody = (error as { responseBody?: RestErrorBody | string })?.responseBody;

  if (typeof responseBody === 'string' && responseBody.trim()) {
    return responseBody;
  }

  const { message, globalErrors = [], fieldErrors = {} } = (responseBody as RestErrorBody)?.error ?? {};
  const validationMessages = [...globalErrors, ...Object.values(fieldErrors).flat()]
    .map((entry) => entry?.message)
    .filter(Boolean);

  if (validationMessages.length > 0) {
    return validationMessages.join(', ');
  }

  if (message) {
    return message;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  const ownMessage = (error as { message?: unknown })?.message;
  return typeof ownMessage === 'string' ? ownMessage : undefined;
}
