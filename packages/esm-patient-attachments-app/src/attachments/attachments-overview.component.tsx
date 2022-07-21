import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AttachmentThumbnail from './attachment-thumbnail.component';
import styles from './attachments-overview.scss';
import Add16 from '@carbon/icons-react/es/add/16';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Loading, Switch } from 'carbon-components-react';
import {
  formatDate,
  LayoutType,
  showModal,
  showToast,
  useLayoutType,
  usePagination,
  UserHasAccess,
} from '@openmrs/esm-framework';
import { PatientChartPagination, EmptyState } from '@openmrs/esm-patient-common-lib';
import { createAttachment, useAttachments } from './attachments.resource';
import { createGalleryEntry } from './utils';
import { UploadedFile } from './attachments-types';
import AttachmentsGridOverview from './attachments-grid-overview.component';
import AttachmentsTableOverview from './attachments-table-overview.component';

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

// function handleDragOver(e: React.DragEvent) {
//   e.preventDefault();
//   e.stopPropagation();
//   e.dataTransfer.dropEffect = 'copy';
// }

const AttachmentsOverview: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, mutate, isValidating, isLoading } = useAttachments(patientUuid, true);
  const [currentImage, setCurrentImage] = useState(0);
  const layOutType = useLayoutType();
  const pageSize = getPageSize(layOutType);
  const attachments = useMemo(() => data.map((item) => createGalleryEntry(item)), [data]);
  const pagination = usePagination(attachments, pageSize);
  const [error, setError] = useState(false);
  const [view, setView] = useState('grid');

  // useEffect(() => {
  //   if (patientUuid) {
  //     const abortController = new AbortController();
  //     getAttachments(patientUuid, true, abortController).then((response) => {
  //       pushAttachments(response.data.results, abortController);
  //     });
  //     return () => abortController.abort();
  // //   }
  // }, [patientUuid]);

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

  // const pushAttachments = useCallback(async (items: Array<any>, abortController: AbortController) => {
  //   const newAttachments = await Promise.all(
  //     items.map(async (item) => {
  //       if (!item.bytesContentFamily) {
  //         const { data } = await getAttachmentByUuid(item.uuid, abortController);
  //         item.bytesContentFamily = data.bytesContentFamily;
  //       }

  //       return {
  //         ...createGalleryEntry(item),
  //         customOverlay: item.comment && (
  //           <div className={styles.thumbnailOverlay}>
  //             <div>{item.comment}</div>
  //           </div>
  //         ),
  //       };
  //     }),
  //   );

  //   // setAttachments((oldAttachments) => [...oldAttachments, ...newAttachments]);
  // }, []);

  const showCam = useCallback(() => {
    const close = showModal('capture-photo-modal', {
      saveFile: (file: UploadedFile) => createAttachment(patientUuid, file),
      closeModal: () => {
        close();
      },
    });
  }, [patientUuid]);

  // const handleUpload = useCallback((e: React.SyntheticEvent, files: FileList | null) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   if (files) {
  //     const abortController = new AbortController();

  //     Promise.all<Attachment>(
  //       Array.prototype.map.call(files, (file) =>
  //         readFileAsString(file).then(
  //           (content) =>
  //             content &&
  //             createAttachment(patientUuid, content, file.name, abortController).then((res) =>
  //               pushAttachments([res.data], abortController),
  //             ),
  //         ),
  //       ),
  //     )
  //       .then((newAttachments) => newAttachments.filter(Boolean))
  //       .then((newAttachments) => setAttachments((attachments) => [...attachments, ...newAttachments]));
  //   }
  // }, []);

  const handleImageSelect = useCallback((index: number) => {
    // setAttachments((attachments) =>
    //   attachments.map((a, i) =>
    //     i === index
    //       ? {
    //           ...a,
    //           isSelected: !a.isSelected,
    //         }
    //       : a,
    //   ),
    // );
  }, []);

  // function deleteSelected() {
  //   // setAttachments((attachments) => attachments.filter((att) => att.isSelected !== true));
  //   const selected = attachments.filter((att) => att.isSelected === true);
  //   const abortController = new AbortController();
  //   Promise.all(selected.map((att) => deleteAttachment(att.id, abortController).then(() => {})));
  // }

  // function handleDelete() {
  //   if (window.confirm('Are you sure you want to delete this attachment?')) {
  //     const abortController = new AbortController();
  //     const id = attachments[currentImage].id;

  //     deleteAttachment(id, abortController).then(() => {
  //       const attachments_tmp = attachments.filter((att) => att.id != id);
  //       // setAttachments(attachments_tmp);
  //     });
  //   }
  // }

  if (!attachments.length) {
    return <EmptyState displayText={'attachments'} headerTitle="Attachments" launchForm={showCam} />;
  }

  return (
    <UserHasAccess privilege="View Attachments">
      <div className={styles.overview}>
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
            <AttachmentsGridOverview attachments={attachments} />
          ) : (
            <AttachmentsTableOverview attachments={attachments} />
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
    </UserHasAccess>
  );
};

export default AttachmentsOverview;
