import React, { useEffect } from 'react';
import styles from './html-form-entry-wrapper.scss';

interface HtmlFormEntryWrapperProps {
  closeWorkspace: () => void;
  src: string;
}

const HtmlFormEntryWrapper: React.FC<HtmlFormEntryWrapperProps> = ({ closeWorkspace, src }) => {
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    iframe.addEventListener('load', () => {
      // hide the header and breadcrumbs
      const dashboard = iframe.contentDocument;
      dashboard.querySelector('header')?.remove();
      dashboard.querySelector('.patient-header')?.remove();
      dashboard.querySelector('#breadcrumbs')?.remove();
      iframe.style.display = 'block';
    });

    // register a listener to close the workspace when HFE sends a "close-workspace" message
    window.addEventListener('message', (event) => {
      if (event.data === 'close-workspace') {
        closeWorkspace();
      }
    });
  }, [closeWorkspace]);

  return (
    <div>
      <iframe src={src} className={styles.wrapper}></iframe>
    </div>
  );
};

export default HtmlFormEntryWrapper;
