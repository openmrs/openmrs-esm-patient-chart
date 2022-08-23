import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Loading, Switch } from '@carbon/react';
import { showModal, showToast, UserHasAccess } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import { createAttachment, deleteAttachmentPermanently, useAttachments } from '../attachments.resource';
import { createGalleryEntry } from '../utils';
import { UploadedFile, Attachment } from '../attachments-types';
import AttachmentsGridOverview from './attachments-grid-overview.component';
import AttachmentsTableOverview from './attachments-table-overview.component';
import AttachmentPreview from './image-preview.component';
import styles from './attachments-overview.scss';
import { List, Thumbnail_2, Add } from '@carbon/react/icons';

// function getPageSize(layoutType: LayoutType) {
//   switch (layoutType) {
//     case 'tablet':
//       return 9;
//     case 'phone':
//       return 3;
//     case 'small-desktop':
//       return 25;
//     // TODO: Add case for the 'large-desktop' layout
//     // case 'large-desktop':
//     //   return 25;
//     default:
//       return 8;
//   }
// }

const AttachmentsOverview: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, mutate, isValidating, isLoading } = useAttachments(patientUuid, true);
  const [attachmentToPreview, setAttachmentToPreview] = useState<Attachment>(null);
  const attachments = useMemo(() => data.map((item) => createGalleryEntry(item)), [data]);
  const [error, setError] = useState(false);
  const [view, setView] = useState('grid');

  const closeImagePDFPreview = useCallback(() => setAttachmentToPreview(null), [setAttachmentToPreview]);

  useEffect(() => {
    if (error === true) {
      showToast({
        critical: true,
        kind: 'error',
        description: t('fileUnsupported', 'File uploaded is not supported'),
        title: t('errorUploading', 'Error uploading a file'),
      });
      setError(false);
    }
  }, [error, t]);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile: (file: UploadedFile) => createAttachment(patientUuid, file),
      closeModal: () => {
        close();
      },
      onCompletion: () => mutate(),
      multipleFiles: true,
      collectDescription: true,
    });
  }, [patientUuid, mutate]);

  const deleteAttachment = useCallback(
    (attachment: Attachment) => {
      deleteAttachmentPermanently(attachment.id, new AbortController())
        .then(() => {
          showToast({
            title: t('fileDeleted', 'File deleted'),
            description: `${attachment.title} ${t('successfullyDeleted', 'successfully deleted')}`,
            kind: 'success',
          });
          setAttachmentToPreview(null);
          mutate();
        })
        .catch((error) => {
          showToast({
            title: t('error', 'Error'),
            description: `${attachment.title} ${t('failedDeleting', "couldn't be deleted")}`,
            kind: 'error',
          });
        });
    },
    [mutate, t, setAttachmentToPreview],
  );

  const deleteAttachmentModal = useCallback(
    (attachment: Attachment) => {
      const close = showModal('delete-attachment-modal', {
        attachment: attachment,
        close: () => close(),
        onConfirmation: (attachment) => {
          deleteAttachment(attachment);
          close();
        },
      });
    },
    [deleteAttachment],
  );

  const openAttachment = useCallback(
    (attachment: Attachment) => {
      if (attachment.bytesContentFamily === 'IMAGE' || attachment.bytesContentFamily === 'PDF') {
        setAttachmentToPreview(attachment);
      } else {
        const anchor = document.createElement('a');
        anchor.setAttribute('href', attachment.src);
        anchor.setAttribute('download', attachment.title);
        anchor.click();
      }
    },
    [setAttachmentToPreview],
  );

  if (!attachments.length) {
    return <EmptyState displayText={'attachments'} headerTitle="Attachments" launchForm={showCam} />;
  }

  return (
    <UserHasAccess privilege="View Attachments">
      <div onDragOverCapture={showCam} className={styles.overview}>
        <div id="container">
          <div className={styles.attachmentsHeader}>
            <h4 className={styles.productiveheading02}>{t('attachments', 'Attachments')}</h4>
            <div>{isValidating && <Loading withOverlay={false} small />}</div>
            <ContentSwitcher onChange={(evt) => setView(`${evt.name}`)}>
              <Switch name="grid">
                <Thumbnail_2 size={16} />
              </Switch>
              <Switch name="tabular">
                <List size={16} />
              </Switch>
            </ContentSwitcher>
            <Button kind="ghost" renderIcon={Add} iconDescription="Add attachment" onClick={showCam}>
              {t('add', 'Add')}
            </Button>
          </div>
          {view === 'grid' ? (
            <AttachmentsGridOverview
              openAttachment={openAttachment}
              deleteAttachment={deleteAttachmentModal}
              isLoading={isLoading}
              attachments={attachments}
            />
          ) : (
            <AttachmentsTableOverview
              openAttachment={openAttachment}
              deleteAttachment={deleteAttachmentModal}
              isLoading={isLoading}
              attachments={attachments}
            />
          )}
        </div>
      </div>
      {attachmentToPreview && (
        <AttachmentPreview
          closePreview={closeImagePDFPreview}
          attachmentToPreview={attachmentToPreview}
          deleteAttachment={deleteAttachmentModal}
        />
      )}
    </UserHasAccess>
  );
};

export default AttachmentsOverview;
