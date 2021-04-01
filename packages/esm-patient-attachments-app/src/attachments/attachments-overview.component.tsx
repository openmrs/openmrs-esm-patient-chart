import React, { useState, useEffect } from "react";
import { useCurrentPatient, UserHasAccess } from "@openmrs/esm-framework";
import {
  getAttachments,
  createAttachment,
  deleteAttachment
} from "./attachments.resource";
import Gallery from "react-grid-gallery";
import styles from "./attachments-overview.css";
import CameraUpload from "./camera-upload.component";
import { Trans } from "react-i18next";
import AttachmentThumbnail from "./attachment-thumbnail.component";
import dayjs from "dayjs";

export default function AttachmentsOverview() {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [, , patientUuid] = useCurrentPatient();

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getAttachments(patientUuid, true, abortController).then(
        (response: any) => {
          const listItems = response.data.results.map(attachment => ({
            id: `${attachment.uuid}`,
            src: `/openmrs/ws/rest/v1/attachment/${attachment.uuid}/bytes`,
            thumbnail: `/openmrs/ws/rest/v1/attachment/${attachment.uuid}/bytes`,
            thumbnailWidth: 320,
            thumbnailHeight: 212,
            caption: attachment.comment,
            isSelected: false,
            dateTime: dayjs(attachment.dateTime).format("YYYY-MM-DD HH:mm:ss"),
            bytesMimeType: attachment.bytesMimeType,
            bytesContentFamily: attachment.bytesContentFamily
          }));
          setAttachments(listItems);
        }
      );
    }
  }, [patientUuid]);

  function handleUpload(e: React.SyntheticEvent, files: FileList | null) {
    e.preventDefault();
    e.stopPropagation();
    const abortController = new AbortController();
    if (files) {
      const attachments_tmp = attachments.slice();
      const result = Promise.all(
        Array.prototype.map.call(files, file =>
          createAttachment(patientUuid, file, file.name, abortController).then(
            (response: any) => {
              const new_attachment = {
                id: `${response.data.uuid}`,
                src: `/openmrs/ws/rest/v1/attachment/${response.data.uuid}/bytes`,
                thumbnail: `/openmrs/ws/rest/v1/attachment/${response.data.uuid}/bytes`,
                thumbnailWidth: 320,
                thumbnailHeight: 212,
                caption: response.data.comment,
                isSelected: false,
                dateTime: dayjs(response.data.dateTime).format(
                  "YYYY-MM-DD HH:mm:ss"
                ),
                bytesMimeType: response.data.bytesMimeType,
                bytesContentFamily: response.data.bytesContentFamily
              };
              attachments_tmp.push(new_attachment);
            }
          )
        )
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
    if (attachment.hasOwnProperty("isSelected")) {
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
    setAttachments(attachments =>
      attachments.filter(att => att.isSelected !== true)
    );
    const selected = attachments.filter(att => att.isSelected === true);
    const abortController = new AbortController();
    const result = Promise.all(
      selected.map(att =>
        deleteAttachment(att.id, abortController).then((response: any) => {})
      )
    );
    result.then(() => {});
  }

  function handleDelete() {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      const abortController = new AbortController();
      const id = attachments[currentImage].id;
      deleteAttachment(id, abortController).then((response: any) => {
        const attachments_tmp = attachments.filter(att => att.id != id);
        setAttachments(attachments_tmp);
      });
    }
  }

  function handleNewAttachment(att: Attachment) {
    const attachments_tmp = attachments.slice();
    attachments_tmp.push(att);
    setAttachments(attachments_tmp);
  }

  return (
    <UserHasAccess privilege="View Attachments">
      <div
        className={styles.overview}
        onPaste={e => handleUpload(e, e.clipboardData.files)}
        onDrop={e => handleUpload(e, e.dataTransfer.files)}
        onDragOver={handleDragOver}
      >
        <div className={styles.upload}>
          <form className={styles.uploadForm}>
            <label htmlFor="fileUpload" className={styles.uploadLabel}>
              <Trans i18nKey="attachmentUploadText"></Trans>
            </label>
            <input
              type="file"
              id="fileUpload"
              multiple
              onChange={e => handleUpload(e, e.target.files)}
            />
          </form>
          <CameraUpload onNewAttachment={handleNewAttachment} />
        </div>
        {getSelectedImages().length !== 0 && (
          <UserHasAccess privilege="Delete Attachment">
            <div className={styles.actions}>
              <button
                onClick={deleteSelected}
                className={`omrs-btn omrs-filled-action`}
              >
                <Trans i18nKey="deleteSelected">Delete selected</Trans>
              </button>
            </div>
          </UserHasAccess>
        )}
        <Gallery
          images={attachments}
          currentImageWillChange={handleCurrentImageChange}
          customControls={[
            <button key="deleteAttachment" onClick={handleDelete}>
              <Trans i18nKey="delete">Delete</Trans>
            </button>
          ]}
          onSelectImage={handleImageSelect}
          thumbnailImageComponent={AttachmentThumbnail}
        />
      </div>
    </UserHasAccess>
  );
}

export type Attachment = {
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
};
