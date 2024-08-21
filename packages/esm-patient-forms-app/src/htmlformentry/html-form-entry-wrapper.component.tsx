import React, { useCallback, useEffect, useRef } from 'react';
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

  const onLoad = useCallback(() => {
    const iframe = iframeRef.current;
    const dashboard = iframeRef.current.contentDocument;
    dashboard.querySelector('header')?.remove();
    dashboard.querySelector('.patient-header')?.remove();
    dashboard.querySelector('#breadcrumbs')?.remove();
    iframe.style.display = 'block';
    iframe.height = dashboard.body.scrollHeight + 50 + 'px'; // set iframe height to the height of the form, with some padding
  }, []);

  return (
    <div>
      <iframe ref={iframeRef} src={src} className={styles.wrapper} onLoad={onLoad}></iframe>
    </div>
  );
};

export default HtmlFormEntryWrapper;
