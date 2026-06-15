/**
 * Decodes HTML entities (e.g. &lt; &gt; &amp;) that the REST API may return
 * in obs values back into their original characters.
 */
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}
