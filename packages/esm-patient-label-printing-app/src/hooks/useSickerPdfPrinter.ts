import { useCallback, useEffect, useRef, useState } from 'react';

const useSickerPdfPrinter = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const printPdf = useCallback((url: string) => {
    return new Promise<void>((resolve, reject) => {
      setIsPrinting(true);

      if (!iframeRef.current) {
        const iframe = document.createElement('iframe');
        iframe.name = 'pdfPrinterFrame';
        iframe.style.position = 'fixed';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        iframeRef.current = iframe;
        document.body.appendChild(iframe);
      }

      const iframe = iframeRef.current;

      const handleLoad = () => {
        try {
          const contentWindow = iframe.contentWindow;

          if (!contentWindow) {
            throw new Error('Failed to access print window');
          }

          contentWindow.focus();
          contentWindow.print();

          if (isSameOrigin(url)) {
            contentWindow.addEventListener('afterprint', handlePrintComplete);
          } else {
            // For cross-origin, we'll assume printing is immediate
            // and rely on the browser's print dialog behavior
            handlePrintComplete();
          }
        } catch (error) {
          handlePrintError(error);
        }
      };

      const handlePrintComplete = () => {
        cleanup();
        resolve();
      };

      const handlePrintError = (error: unknown) => {
        cleanup();
        reject(error instanceof Error ? error : new Error('Printing failed'));
      };

      const cleanup = () => {
        iframe.onload = null;
        iframe.onerror = null;
        setIsPrinting(false);

        // Remove event listener if same-origin
        if (iframe.contentWindow && isSameOrigin(url)) {
          try {
            iframe.contentWindow.removeEventListener('afterprint', handlePrintComplete);
          } catch {
            // Ignore cross-origin errors
          }
        }
      };

      iframe.onload = handleLoad;
      iframe.onerror = () => handlePrintError(new Error('Failed to load PDF'));
      iframe.src = url;
    });
  }, []);

  const isSameOrigin = (url: string) => {
    try {
      return new URL(url).origin === window.location.origin;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current);
      }
    };
  }, []);

  return { printPdf, isPrinting };
};
