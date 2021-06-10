import React, { useState, useEffect } from 'react';
import AttachmentThumbnail from './attachment-thumbnail.component';
import dayjs from 'dayjs';
import Gallery from 'react-grid-gallery';
import styles from './attachments-overview.scss';
import CameraUpload from './camera-upload.component';
import Button from 'carbon-components-react/lib/components/Button';
import Add16 from '@carbon/icons-react/es/add/16';
import { Trans } from 'react-i18next';
import { LayoutType, useLayoutType, usePagination, UserHasAccess } from '@openmrs/esm-framework';
import { PatientChartPagination, EmptyState } from '@openmrs/esm-patient-common-lib';
import { Modal } from '../ui-components/modal/modal.component';
import { getAttachments, createAttachment, deleteAttachment, getAttachmentByUuid } from './attachments.resource';
import './gallery.overrides.scss';

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
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [showCam, setShowCam] = useState(false);
  const layOutType = useLayoutType();
  const pageSize = getPageSize(layOutType);
  const pagination = usePagination(attachments, pageSize);

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
              images={pagination.results}
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
              currentItems={pagination.results.length}
              totalItems={attachments.length}
              onPageNumberChange={(prop) => pagination.goTo(prop.page)}
              pageNumber={pagination.currentPage}
              pageSize={pageSize}
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
