import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AttachmentThumbnail from './attachment-thumbnail.component';
import Gallery from 'react-grid-gallery';
import styles from './attachments-overview.scss';
import Button from 'carbon-components-react/lib/components/Button';
import Add16 from '@carbon/icons-react/es/add/16';
import { useTranslation } from 'react-i18next';
import { LayoutType, showModal, useLayoutType, usePagination, UserHasAccess } from '@openmrs/esm-framework';
import { PatientChartPagination, EmptyState } from '@openmrs/esm-patient-common-lib';
import { getAttachments, createAttachment, deleteAttachment, getAttachmentByUuid } from './attachments.resource';
import { createGalleryEntry, readFileAsString } from './utils';

export interface Attachment {
  id: string;
  src: string;
  thumbnail: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  caption: string;
  isSelected: boolean;
  dateTime?: string;
  bytesMimeType?: string;
  bytesContentFamily?: string;
}

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
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const layOutType = useLayoutType();
  const pageSize = getPageSize(layOutType);
  const pagination = usePagination(attachments, pageSize);

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getAttachments(patientUuid, true, abortController).then((response) => {
        setAttachments(response.data.results.map(createGalleryEntry));
      });
      return () => abortController.abort();
    }
  }, [patientUuid]);

  const pushAttachment = useCallback((data: any) => {
    const att = createGalleryEntry(data);

    if (att.bytesContentFamily) {
      setAttachments((attachments) => [...attachments, att]);
    } else {
      getAttachmentByUuid(att.id, new AbortController()).then(({ data }) => {
        att.bytesContentFamily = data.bytesContentFamily;
        setAttachments((attachments) => [...attachments, att]);
      });
    }
  }, []);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      onNewAttachment: (data: any) => {
        pushAttachment(data);
        close();
      },
      openCameraOnRender: true,
      shouldNotRenderButton: true,
      patientUuid,
    });
  }, [patientUuid]);

  function handleUpload(e: React.SyntheticEvent, files: FileList | null) {
    e.preventDefault();
    e.stopPropagation();
    const abortController = new AbortController();

    if (files) {
      Promise.all<Attachment>(
        Array.prototype.map.call(files, (file) =>
          readFileAsString(file).then(
            (content) =>
              content &&
              createAttachment(patientUuid, content, file.name, abortController).then((res) =>
                pushAttachment(res.data),
              ),
          ),
        ),
      )
        .then((newAttachments) => newAttachments.filter(Boolean))
        .then((newAttachments) => setAttachments((attachments) => [...attachments, ...newAttachments]));
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }

  function handleCurrentImageChange(index: number) {
    setCurrentImage(index);
  }

  function handleImageSelect(index: number) {
    setAttachments((attachments) =>
      attachments.map((a, i) =>
        i === index
          ? {
              ...a,
              isSelected: !a.isSelected,
            }
          : a,
      ),
    );
  }

  function deleteSelected() {
    setAttachments((attachments) => attachments.filter((att) => att.isSelected !== true));
    const selected = attachments.filter((att) => att.isSelected === true);
    const abortController = new AbortController();
    const result = Promise.all(
      selected.map((att) => deleteAttachment(att.id, abortController).then((response: any) => {})),
    );
    result.then(() => {});
  }

  function handleDelete() {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      const abortController = new AbortController();
      const id = attachments[currentImage].id;
      deleteAttachment(id, abortController).then((response: any) => {
        const attachments_tmp = attachments.filter((att) => att.id != id);
        setAttachments(attachments_tmp);
      });
    }
  }

  const currentAttachments = useMemo(() => {
    return pagination.results.map((attachment) => ({
      ...attachment,
      customOverlay: attachment.caption && (
        <div className={styles.thumbnailOverlay}>
          <div>{attachment.caption}</div>
        </div>
      ),
    }));
  }, [pagination.results]);

  return (
    <UserHasAccess privilege="View Attachments">
      <div
        className={styles.overview}
        onPaste={(e) => handleUpload(e, e.clipboardData.files)}
        onDrop={(e) => handleUpload(e, e.dataTransfer.files)}
        onDragOver={handleDragOver}>
        {attachments.some((m) => m.isSelected) && (
          <UserHasAccess privilege="Delete Attachment">
            <div className={styles.actions}>
              <Button kind="danger" onClick={deleteSelected}>
                {t('deleteSelected', 'Delete selected')}
              </Button>
            </div>
          </UserHasAccess>
        )}
        {attachments.length ? (
          <div
            id="container"
            className={`${styles.galleryContainer} ${layOutType === 'phone' ? styles.mobileLayout : ''}`}>
            <div className={styles.attachmentsHeader}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{t('attachments', 'Attachments')}</h4>
              <Button kind="ghost" renderIcon={Add16} iconDescription="Add attachment" onClick={showCam}>
                {t('add', 'Add')}
              </Button>
            </div>
            <Gallery
              images={currentAttachments}
              currentImageWillChange={handleCurrentImageChange}
              customControls={[
                <Button kind="danger" onClick={handleDelete} className={styles.btnOverrides}>
                  {t('delete', 'Delete')}
                </Button>,
              ]}
              onSelectImage={handleImageSelect}
              thumbnailImageComponent={AttachmentThumbnail}
              margin={3}
            />
            <PatientChartPagination
              currentItems={pagination.results.length}
              totalItems={attachments.length}
              onPageNumberChange={(prop) => pagination.goTo(prop.page)}
              pageNumber={pagination.currentPage}
              pageSize={pageSize}
            />
          </div>
        ) : (
          <EmptyState displayText={'attachments'} headerTitle="Attachments" launchForm={showCam} />
        )}
      </div>
    </UserHasAccess>
  );
};

export default AttachmentsOverview;
