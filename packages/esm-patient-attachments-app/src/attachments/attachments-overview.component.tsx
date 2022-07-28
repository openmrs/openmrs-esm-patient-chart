import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './attachments-overview.scss';
import Add16 from '@carbon/icons-react/es/add/16';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Loading, Switch } from 'carbon-components-react';
import { LayoutType, showModal, showToast, useLayoutType, usePagination, UserHasAccess } from '@openmrs/esm-framework';
import { PatientChartPagination, EmptyState } from '@openmrs/esm-patient-common-lib';
import { createAttachment, deleteAttachmentPermanently, useAttachments } from './attachments.resource';
import { createGalleryEntry } from './utils';
import { UploadedFile } from './attachments-types';
import AttachmentsGridOverview from './attachments-grid-overview.component';
import AttachmentsTableOverview from './attachments-table-overview.component';
import { Attachment } from './attachments-types';
import ImagePreview from './image-preview.component';

function getPageSize(layoutType: LayoutType) {
  switch (layoutType) {
    case 'tablet':
      return 9;
    case 'phone':
      return 3;
    case 'desktop':
      return 25;
    default:
      return 8;
  }
}

const AttachmentsOverview: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, mutate, isValidating, isLoading } = useAttachments(patientUuid, true);
  const [imageSelected, setImageSelected] = useState<Attachment>(null);
  const layOutType = useLayoutType();
  const pageSize = getPageSize(layOutType);
  const attachments = useMemo(() => data.map((item) => createGalleryEntry(item)), [data]);
  const pagination = usePagination(attachments, pageSize);
  const [error, setError] = useState(false);
  const [view, setView] = useState('grid');

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
  }, [error]);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile: (file: UploadedFile) => createAttachment(patientUuid, file),
      closeModal: () => {
        close();
      },
      onCompletion: () => mutate(),
    });
  }, [patientUuid]);

  const deleteAttachment = useCallback(
    (attachment: Attachment) => {
      deleteAttachmentPermanently(attachment.id, new AbortController())
        .then(() => {
          showToast({
            title: t('fileDeleted', 'File deleted'),
            description: `${attachment.title} ${t('successfullyDeleted', 'successfully deleted')}`,
            kind: 'success',
          });
          setImageSelected(null);
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
    [mutate, showToast, t, setImageSelected],
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
    [showModal, deleteAttachment],
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
              <Switch name="grid" text="Grid" selected={view === 'grid'} />
              <Switch name="tabular" text="Table" selected={view === 'tabular'} />
            </ContentSwitcher>
            <Button kind="ghost" renderIcon={Add16} iconDescription="Add attachment" onClick={showCam}>
              {t('add', 'Add')}
            </Button>
          </div>
          {view === 'grid' ? (
            <AttachmentsGridOverview
              onAttachmentSelect={setImageSelected}
              deleteAttachment={deleteAttachmentModal}
              isLoading={isLoading}
              attachments={attachments}
            />
          ) : (
            <AttachmentsTableOverview
              onAttachmentSelect={setImageSelected}
              deleteAttachment={deleteAttachmentModal}
              isLoading={isLoading}
              attachments={attachments}
            />
          )}

          <PatientChartPagination
            currentItems={pagination.results.length}
            totalItems={attachments.length}
            onPageNumberChange={(prop) => pagination.goTo(prop.page)}
            pageNumber={pagination.currentPage}
            pageSize={pageSize}
          />
        </div>
      </div>
      {imageSelected && (
        <ImagePreview
          closePreview={() => setImageSelected(null)}
          imageSelected={imageSelected}
          deleteAttachment={deleteAttachmentModal}
        />
      )}
    </UserHasAccess>
  );
};

export default AttachmentsOverview;
