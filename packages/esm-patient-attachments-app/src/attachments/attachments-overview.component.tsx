import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Loading, Switch } from '@carbon/react';
import { showModal, showSnackbar, useLayoutType, UserHasAccess } from '@openmrs/esm-framework';
import { CardHeader, EmptyState } from '@openmrs/esm-patient-common-lib';
import { createAttachment, deleteAttachmentPermanently, useAttachments } from '../attachments.resource';
import { createGalleryEntry } from '../utils';
import { UploadedFile, Attachment } from '../attachments-types';
import AttachmentsGridOverview from './attachments-grid-overview.component';
import AttachmentsTableOverview from './attachments-table-overview.component';
import AttachmentPreview from './image-preview.component';
import styles from './attachments-overview.scss';
import { List, Thumbnail_2, Add } from '@carbon/react/icons';

const AttachmentsOverview: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, mutate, isValidating, isLoading } = useAttachments(patientUuid, true);
  const [attachmentToPreview, setAttachmentToPreview] = useState<Attachment>(null);
  const attachments = useMemo(() => data.map((item) => createGalleryEntry(item)), [data]);
  const [error, setError] = useState(false);
  const [view, setView] = useState('grid');
  const isTablet = useLayoutType() === 'tablet';

  const closeImagePDFPreview = useCallback(() => setAttachmentToPreview(null), [setAttachmentToPreview]);

  useEffect(() => {
    if (error === true) {
      showSnackbar({
        isLowContrast: true,
        kind: 'error',
        subtitle: t('fileUnsupported', 'File uploaded is not supported'),
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
          mutate();
          setAttachmentToPreview(null);

          showSnackbar({
            title: t('fileDeleted', 'File deleted'),
            subtitle: `${attachment.title} ${t('successfullyDeleted', 'successfully deleted')}`,
            kind: 'success',
            isLowContrast: true,
          });
        })
        .catch((error) => {
          showSnackbar({
            title: t('error', 'Error'),
            subtitle: `${attachment.title} ${t('failedDeleting', "couldn't be deleted")}`,
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
    return (
      <EmptyState
        displayText={t('attachmentsInLowerCase', 'attachments')}
        headerTitle={t('attachmentsInProperFormat', 'Attachments')}
        launchForm={showCam}
      />
    );
  }

  return (
    <UserHasAccess privilege="View Attachments">
      <div onDragOverCapture={showCam} className={styles.overview}>
        <div id="container">
          <CardHeader title={t('attachments', 'Attachments')}>
            <div className={styles.validatingDataIcon}>{isValidating && <Loading withOverlay={false} small />}</div>
            <div className={styles.attachmentHeaderActionItems}>
              <ContentSwitcher onChange={(evt) => setView(`${evt.name}`)} size={isTablet ? 'md' : 'sm'}>
                <Switch name="grid">
                  <Thumbnail_2 size={16} />
                </Switch>
                <Switch name="tabular">
                  <List size={16} />
                </Switch>
              </ContentSwitcher>
              <div className={styles.divider} />
              <Button kind="ghost" renderIcon={Add} iconDescription="Add attachment" onClick={showCam}>
                {t('add', 'Add')}
              </Button>
            </div>
          </CardHeader>
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
