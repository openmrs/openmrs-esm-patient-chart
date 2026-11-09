import { decode } from 'html-entities';

/**
 * Decodes HTML entities (e.g. &lt; &gt; &amp;) that the REST API may return
 * in obs values back into their original characters.
 */
export function decodeHtmlEntities(text: string): string {
  return decode(text);
}
