import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@carbon/react';
import { type Attachment } from '@openmrs/esm-framework';

interface AttachmentMediaProps {
  attachment: Attachment;
  imageClassName?: string;
  pdfClassName?: string;
}

/**
 * Renders an attachment's content by type: images inline, PDFs in a frame, and a link to open
 * anything else. Shared by the full-screen preview on the Attachments page and the preview modal.
 */
const AttachmentMedia: React.FC<AttachmentMediaProps> = ({ attachment, imageClassName, pdfClassName }) => {
  const { t } = useTranslation();

  if (attachment.bytesContentFamily === 'IMAGE') {
    return <img className={imageClassName} src={attachment.src} alt={attachment.description || attachment.filename} />;
  }

  if (attachment.bytesContentFamily === 'PDF') {
    return <iframe className={pdfClassName} src={attachment.src} title={attachment.filename} />;
  }

  return (
    <p>
      {t('noPreviewAvailable', 'No preview is available for this file.')}{' '}
      <Link href={attachment.src} target="_blank" rel="noopener noreferrer">
        {t('openFile', 'Open file')}
      </Link>
    </p>
  );
};

export default AttachmentMedia;
