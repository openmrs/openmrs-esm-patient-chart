import React, { useEffect, useRef } from 'react';

const PrintSizeWrapper = ({ children }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const mediaQueryList = window.matchMedia('print');

    const handlePrintMedia = (mql) => {
      if (!wrapperRef.current) return;

      const style = document.createElement('style');
      style.textContent = `
        @page {
          size: auto;
          margin: 0mm;
        }
        
        @media print {
          .print-wrapper {
            width: 100vw !important;
            height: 100vh !important;
            transform-origin: top left;
            transform: scale(var(--print-scale));
          }
          
          .print-content {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
        }
      `;
      document.head.appendChild(style);

      // Calculate scale on print
      window.onbeforeprint = () => {
        if (!wrapperRef.current) return;
        const content = wrapperRef.current;
        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        // Get actual page dimensions from CSS
        const pageWidth = window.innerWidth;
        const pageHeight = window.innerHeight;

        // Calculate scale to fit
        const scaleX = pageWidth / contentWidth;
        const scaleY = pageHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to ensure margins

        document.documentElement.style.setProperty('--print-scale', scale.toString());
      };
    };

    mediaQueryList.addListener(handlePrintMedia);
    handlePrintMedia(mediaQueryList);

    return () => {
      mediaQueryList.removeListener(handlePrintMedia);
      window.onbeforeprint = null;
    };
  }, []);

  return (
    <div ref={wrapperRef} className="print-wrapper">
      <div className="print-content">{children}</div>
    </div>
  );
};

export default PrintSizeWrapper;
