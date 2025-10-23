import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useStickerPdfPrinter = () => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const printPdf = useCallback(
    (url: string) => {
      if (isPrinting) {
        return Promise.reject(new Error(t('printInProgress', 'Print already in progress')));
      }

      return new Promise<void>((resolve, reject) => {
        setIsPrinting(true);

        const sameOrigin = isSameOrigin(url);

        if (!iframeRef.current) {
          const iframe = document.createElement('iframe');
          iframe.name = 'pdfPrinterFrame';
          iframe.setAttribute('aria-hidden', 'true');
          Object.assign(iframe.style, {
            position: 'fixed',
            width: '0',
            height: '0',
            border: 'none',
            visibility: 'hidden',
            pointerEvents: 'none',
          });
          iframeRef.current = iframe;
          document.body.appendChild(iframe);
        }

        const iframe = iframeRef.current;
        let printCompleted = false;

        const handleLoad = () => {
          try {
            const contentWindow = iframe.contentWindow;

            if (!contentWindow) {
              throw new Error(t('failedToAccessPrintWindow', 'Failed to access print window'));
            }

            contentWindow.focus();
            contentWindow.print();

            if (sameOrigin) {
              // Use afterprint event for same-origin
              const afterPrintHandler = () => {
                if (!printCompleted) {
                  printCompleted = true;
                  handlePrintComplete();
                }
              };
              contentWindow.addEventListener('afterprint', afterPrintHandler);

              cleanupRef.current = () => {
                contentWindow.removeEventListener('afterprint', afterPrintHandler);
              };
            } else {
              setTimeout(() => {
                if (!printCompleted) {
                  printCompleted = true;
                  handlePrintComplete();
                }
              }, 500);
            }
          } catch (error) {
            if (!printCompleted) {
              printCompleted = true;
              handlePrintError(error);
            }
          }
        };

        const handlePrintComplete = () => {
          cleanup();
          resolve();
        };

        const handlePrintError = (error: unknown) => {
          cleanup();
          reject(error instanceof Error ? error : new Error(t('printingFailed', 'Printing failed')));
        };

        const cleanup = () => {
          iframe.onload = null;
          iframe.onerror = null;

          if (cleanupRef.current) {
            try {
              cleanupRef.current();
            } catch {
              // Ignore cleanup errors
            }
            cleanupRef.current = null;
          }

          setIsPrinting(false);
        };

        iframe.onload = handleLoad;
        iframe.onerror = () => handlePrintError(new Error(t('failedToLoadPDF', 'Failed to load PDF')));

        iframe.src = url;
      });
    },
    [t, isPrinting],
  );

  const isSameOrigin = (url: string): boolean => {
    try {
      const urlObj = new URL(url, window.location.href);
      return urlObj.origin === window.location.origin;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        try {
          cleanupRef.current();
        } catch {
          // Ignore cleanup errors
        }
      }

      if (iframeRef.current && document.body.contains(iframeRef.current)) {
        document.body.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
    };
  }, []);

  return { printPdf, isPrinting };
};
