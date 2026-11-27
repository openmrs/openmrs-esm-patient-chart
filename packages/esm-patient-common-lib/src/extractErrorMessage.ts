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
 * Plain-text response bodies are returned unless they look like HTML.
 * For structured REST errors, global and field validation messages are joined with `separator` (", " by default).
 * Without validation messages, the server's error message is used.
 * If the server gives no reason, `fallback` is returned when given, otherwise the error's own message.
 */
export function extractErrorMessage(error: unknown, fallback?: string, separator = ', '): string | undefined {
  const responseBody = (error as { responseBody?: RestErrorBody | string })?.responseBody;

  if (typeof responseBody === 'string' && responseBody.trim() && !responseBody.trimStart().startsWith('<')) {
    return responseBody;
  }

  const { message, globalErrors = [], fieldErrors = {} } = (responseBody as RestErrorBody)?.error ?? {};
  const validationMessages = [...globalErrors, ...Object.values(fieldErrors).flat()]
    .map((entry) => entry?.message)
    .filter(Boolean);

  if (validationMessages.length > 0) {
    return validationMessages.join(separator);
  }

  // RestUtil.wrapErrorResponse formats this as "reason [message]" or "[message]", and a missing message becomes "[null]"
  const serverMessage = message?.replace(/\s*\[null\]$/, '').replace(/^\[([\s\S]*)\]$/, '$1');
  if (serverMessage) {
    return serverMessage;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  const ownMessage = (error as { message?: unknown })?.message;
  return typeof ownMessage === 'string' ? ownMessage : undefined;
}
