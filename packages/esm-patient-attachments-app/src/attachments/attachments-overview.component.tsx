import React, { useState, useEffect } from 'react';
import AttachmentThumbnail from './attachment-thumbnail.component';
import dayjs from 'dayjs';
import Gallery from 'react-grid-gallery';
import styles from './attachments-overview.scss';
import CameraUpload from './camera-upload.component';
import { useLayoutType, UserHasAccess } from '@openmrs/esm-framework';
import Button from 'carbon-components-react/lib/components/Button';
import Add16 from '@carbon/icons-react/es/add/16';
import PatientChartPagination, { paginate } from '../ui-components/pagination/pagination.component';
import { getAttachments, createAttachment, deleteAttachment, getAttachmentByUuid } from './attachments.resource';
import { Trans } from 'react-i18next';
import { Modal } from '../ui-components/modal/modal.component';
import './gallery.overrides.scss';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
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

const AttachmentsOverview: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [currentPage, setCurrentPage] = React.useState<Array<any>>([]);
  const [showCam, setShowCam] = useState(false);
  const layOutType = useLayoutType();
  let pageSize = 8;
  switch (layOutType) {
    case 'tablet':
      pageSize = 9;
      break;
    case 'phone':
      pageSize = 3;
      break;
    case 'desktop':
      pageSize = 25;
      break;
  }

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getAttachments(patientUuid, true, abortController).then((response: any) => {
        const listItems = response.data.results.map((attachment) => ({
          id: `${attachment.uuid}`,
          src: `/openmrs/ws/rest/v1/attachment/${attachment.uuid}/bytes`,
          thumbnail: `/openmrs/ws/rest/v1/attachment/${attachment.uuid}/bytes`,
          thumbnailWidth: 170,
          thumbnailHeight: 130,
          isSelected: false,
          dateTime: dayjs(attachment.dateTime).format('YYYY-MM-DD HH:mm:ss'),
          bytesMimeType: attachment.bytesMimeType,
          bytesContentFamily: attachment.bytesContentFamily,
          customOverlay: attachment.comment && (
            <div className={styles.thumbnailOverlay}>
              <div>{attachment.comment}</div>
            </div>
          ),
          caption: attachment.comment,
        }));
        setAttachments(listItems);
      });
    }
  }, [patientUuid]);

  useEffect(() => {
    if (attachments.length) {
      const [page, allPages] = paginate<any>(attachments, pageNumber, pageSize);
      setCurrentPage(page);
    }
  }, [attachments, pageNumber, layOutType]);

  function handleUpload(e: React.SyntheticEvent, files: FileList | null) {
    e.preventDefault();
    e.stopPropagation();
    const abortController = new AbortController();
    if (files) {
      const attachments_tmp = attachments.slice();
      const result = Promise.all(
        Array.prototype.map.call(files, (file) =>
          createAttachment(patientUuid, file, file.name, abortController).then((response: any) => {
            const new_attachment = {
              id: `${response.data.uuid}`,
              src: `/openmrs/ws/rest/v1/attachment/${response.data.uuid}/bytes`,
              thumbnail: `/openmrs/ws/rest/v1/attachment/${response.data.uuid}/bytes?view=complexdata.view.thumbnail`,
              thumbnailWidth: 320,
              thumbnailHeight: 212,
              caption: response.data.comment,
              isSelected: false,
              dateTime: dayjs(response.data.dateTime).format('YYYY-MM-DD HH:mm:ss'),
              bytesMimeType: response.data.bytesMimeType,
              bytesContentFamily: response.data.bytesContentFamily,
            };
            attachments_tmp.push(new_attachment);
          }),
        ),
      );
      result.then(() => setAttachments(attachments_tmp));
    }
  }

  function handleDragOver(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleCurrentImageChange(index: number) {
    setCurrentImage(index);
  }

  function handleImageSelect(index: number) {
    const attachments_tmp = attachments.slice();
    const attachment = attachments_tmp[index];
    if (attachment.hasOwnProperty('isSelected')) {
      attachment.isSelected = !attachment.isSelected;
    } else {
      attachment.isSelected = true;
    }
    setAttachments(attachments_tmp);
  }

  function getSelectedImages() {
    let selected = [];
    attachments.forEach((att, index) => {
      if (att.isSelected === true) {
        selected.push(att);
      }
    });
    return selected;
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

  function handleNewAttachment(att: Attachment) {
    if (att.bytesContentFamily) {
      setAttachments([...attachments, att]);
    } else {
      getAttachmentByUuid(att.id, new AbortController()).then(({ data }) => {
        att.bytesContentFamily = data.bytesContentFamily;
        setAttachments([...attachments, att]);
      });
    }
  }

  return (
    <UserHasAccess privilege="View Attachments">
      <div
        className={styles.overview}
        onPaste={(e) => handleUpload(e, e.clipboardData.files)}
        onDrop={(e) => handleUpload(e, e.dataTransfer.files)}
        onDragOver={handleDragOver}>
        {showCam && (
          <Modal>
            <CameraUpload
              onNewAttachment={handleNewAttachment}
              openCameraOnRender={true}
              shouldNotRenderButton={true}
              closeCamera={() => setShowCam(false)}
              patientUuid={patientUuid}
            />
          </Modal>
        )}
        {getSelectedImages().length !== 0 && (
          <UserHasAccess privilege="Delete Attachment">
            <div className={styles.actions}>
              <Button kind="danger" onClick={deleteSelected}>
                <Trans i18nKey="deleteSelected">Delete selected</Trans>
              </Button>
            </div>
          </UserHasAccess>
        )}
        {attachments.length ? (
          <div
            id="container"
            className={`${styles.galleryContainer} ${layOutType === 'phone' ? styles.mobileLayout : ''}`}>
            <div className={styles.attachmentsHeader}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>Attachments</h4>
              <Button
                kind="ghost"
                renderIcon={Add16}
                iconDescription="Add attachment"
                onClick={(e) => setShowCam(true)}>
                Add
              </Button>
            </div>
            <Gallery
              images={currentPage}
              currentImageWillChange={handleCurrentImageChange}
              customControls={[
                <Button kind="danger" onClick={handleDelete} className={styles.btnOverrides}>
                  Delete
                </Button>,
              ]}
              onSelectImage={handleImageSelect}
              thumbnailImageComponent={AttachmentThumbnail}
              margin={3}
            />
            <PatientChartPagination
              items={attachments}
              onPageNumberChange={(prop) => setPageNumber(prop.page)}
              pageNumber={pageNumber}
              pageSize={pageSize}
              pageUrl=""
              currentPage={currentPage}
            />
          </div>
        ) : (
          <EmptyState displayText={'attachments'} headerTitle="Attachments" launchForm={() => setShowCam(true)} />
        )}
      </div>
    </UserHasAccess>
  );
};

export default AttachmentsOverview;
