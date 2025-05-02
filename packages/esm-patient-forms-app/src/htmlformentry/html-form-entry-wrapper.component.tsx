import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './html-form-entry-wrapper.scss';
import { InlineLoading } from '@carbon/react';

interface HtmlFormEntryWrapperProps {
  closeWorkspaceWithSavedChanges: () => void;
  src: string;
}

const HtmlFormEntryWrapper: React.FC<HtmlFormEntryWrapperProps> = ({ closeWorkspaceWithSavedChanges, src }) => {
  const iframeRef = useRef<HTMLIFrameElement>();
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // set up a listener to listen for a message from HFE-UI to close the workspace
  useEffect(() => {
    const callback = (event) => event?.data === 'close-workspace' && closeWorkspaceWithSavedChanges();
    window.addEventListener('message', callback);
    return () => window.removeEventListener('message', callback); // cleanup on unmount
  }, [closeWorkspaceWithSavedChanges]);

  // hide the headers and breadcrumbs of the O2 page on load
  const onLoad = useCallback(() => {
    setIsIframeLoading(false);
    iframeRef.current.contentWindow.addEventListener('beforeunload', () => setIsIframeLoading(true));
    const iframe = iframeRef.current;
    const dashboard = iframeRef.current.contentDocument;
    dashboard.querySelector('header')?.remove();
    dashboard.querySelector('.patient-header')?.remove();
    dashboard.querySelector('#breadcrumbs')?.remove();
    iframe.style.display = 'block';
    iframe.height = dashboard.body.scrollHeight + 50 + 'px'; // set iframe height to the height of the form, with some padding

    const styleTag = dashboard.createElement('style');
    styleTag.innerHTML = `@media screen {
      body { background: white; }
     }`;
    dashboard.head.appendChild(styleTag);
  }, []);

  return (
    <div>
      {isIframeLoading && <InlineLoading />}
      <iframe ref={iframeRef} src={src} className={styles.wrapper} onLoad={onLoad}></iframe>
    </div>
  );
};

export default HtmlFormEntryWrapper;
