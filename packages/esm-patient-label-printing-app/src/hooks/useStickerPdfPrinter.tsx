import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useStickerPdfPrinter = () => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const printPdf = useCallback(
    (url: string) => {
      if (isPrinting) {
        return Promise.reject(new Error(t('printInProgress', 'Print already in progress')));
      }

      return new Promise<void>((resolve) => {
        setIsPrinting(true);

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
        let hasClosed = false;

        const handleLoad = () => {
          try {
            const contentWindow = iframe.contentWindow;
            if (!contentWindow) throw new Error('No content window');

            const cleanup = () => {
              if (hasClosed) return;
              hasClosed = true;
              setIsPrinting(false);
              resolve();
            };

            try {
              contentWindow.addEventListener('afterprint', cleanup, { once: true });
            } catch (e) {
              // Cross-origin, use polling fallback
            }

            contentWindow.focus();
            contentWindow.print();

            let wasFocused = false;
            const pollInterval = setInterval(() => {
              const hasFocus = document.hasFocus();
              if (hasFocus && wasFocused) cleanup();
              if (!hasFocus) wasFocused = true;
            }, 250);

            setTimeout(cleanup, 30000);
            setTimeout(() => clearInterval(pollInterval), 30000);
          } catch (error) {
            setIsPrinting(false);
            resolve();
          }
        };

        iframe.onload = handleLoad;
        iframe.onerror = () => {
          setIsPrinting(false);
          resolve();
        };
        iframe.src = url;
      });
    },
    [t, isPrinting],
  );

  useEffect(() => {
    return () => {
      if (iframeRef.current?.parentNode) {
        iframeRef.current.parentNode.removeChild(iframeRef.current);
      }
    };
  }, []);

  return { printPdf, isPrinting };
};
