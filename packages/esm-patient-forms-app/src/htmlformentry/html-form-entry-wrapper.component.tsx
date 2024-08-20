import React, { useEffect, useRef } from 'react';
import styles from './html-form-entry-wrapper.scss';

interface HtmlFormEntryWrapperProps {
  closeWorkspace: () => void;
  src: string;
}

const HtmlFormEntryWrapper: React.FC<HtmlFormEntryWrapperProps> = ({ closeWorkspace, src }) => {
  const iframeRef = useRef<HTMLIFrameElement>();

  useEffect(() => {
    const callback = (event) => event?.data === 'close-workspace' && closeWorkspace();
    window.addEventListener('message', callback);
    return () => window.removeEventListener('message', callback); // cleanup on unmount
  }, [closeWorkspace]);

  return (
    <div>
      <iframe
        ref={iframeRef}
        src={src}
        className={styles.wrapper}
        onLoad={() => {
          const dashboard = iframeRef.current.contentDocument;
          dashboard.querySelector('header')?.remove();
          dashboard.querySelector('.patient-header')?.remove();
          dashboard.querySelector('#breadcrumbs')?.remove();
          iframeRef.current.style.display = 'block';
        }}
      ></iframe>
    </div>
  );
};

export default HtmlFormEntryWrapper;
