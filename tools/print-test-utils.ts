import { onTestFinished, vi } from 'vitest';

export interface PrintJob {
  /** A copy of the print iframe's body at the moment `print()` was called, held in a detached fragment */
  content: HTMLElement;
  /** The text of every `<style>` in the print iframe, which includes the `pageStyle` option */
  styles: Array<string>;
  /** The top-level document title at the moment `print()` was called */
  documentTitle: string;
}

/**
 * Records what react-to-print sends to the browser's print dialog, without mocking the library.
 *
 * react-to-print clones the content to print into a hidden iframe it appends to `document.body`,
 * then calls `print()` on that iframe's window. This stubs `print()` on every iframe appended
 * during the current test and records the iframe's body and the document title when it is called.
 */
export function capturePrintJobs() {
  const jobs: Array<PrintJob> = [];
  const originalAppendChild = document.body.appendChild;

  const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(function <T extends Node>(
    this: HTMLElement,
    node: T,
  ): T {
    const appended = originalAppendChild.call(this, node) as T;

    if (node instanceof HTMLIFrameElement && node.contentWindow) {
      node.contentWindow.print = () => {
        // Copied into a fragment so that it outlives the iframe and accessible name lookups can resolve ids
        const content = document.importNode(node.contentDocument.body, true);
        document.createDocumentFragment().append(content);
        const styles = Array.from(node.contentDocument.querySelectorAll('style'), (style) => style.textContent);
        jobs.push({ content, styles, documentTitle: document.title });
      };
    }

    return appended;
  });

  onTestFinished(() => appendChildSpy.mockRestore());

  return jobs;
}
