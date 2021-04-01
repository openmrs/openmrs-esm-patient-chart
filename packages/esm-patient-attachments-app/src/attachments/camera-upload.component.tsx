import React, { useEffect, useState } from "react";
import CameraFrame from "./camera-frame.component";
import ImagePreview from "./image-preview.component";
import styles from "./camera-upload.css";
import Camera from "react-html5-camera-photo";
require("react-html5-camera-photo/build/css/index.css");
require("./styles.css");
import { createAttachment } from "./attachments.resource";
import { useCurrentPatient } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { Attachment } from "./attachments-overview.component";

export default function CameraUpload(props: CameraUploadProps) {
  const [cameraIsOpen, setCameraIsOpen] = useState(props.openCameraOnRender);
  const [dataUri, setDataUri] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const { t } = useTranslation();

  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  function openCamera() {
    setCameraIsOpen(true);
  }

  function handleCloseCamera() {
    setCameraIsOpen(false);
    props.openCameraOnRender = false;
    if (props.closeCamera) {
      props.closeCamera();
    }
    clearCamera();
  }

  function handleTakePhoto(dataUri: string) {
    setDataUri(dataUri);
    if (props.onTakePhoto) {
      props.onTakePhoto(dataUri);
    }
  }

  function handleCancelCapture() {
    clearCamera();
  }

  function clearCamera() {
    setDataUri("");
    setSelectedFile(null);
  }

  function handleSaveImage(dataUri: string, caption: string) {
    const abortController = new AbortController();
    createAttachment(patientUuid, null, caption, abortController, dataUri).then(
      res => {
        const att = {
          id: `${res.data.uuid}`,
          src: `/openmrs/ws/rest/v1/attachment/${res.data.uuid}/bytes`,
          thumbnail: `/openmrs/ws/rest/v1/attachment/${res.data.uuid}/bytes`,
          thumbnailWidth: 320,
          thumbnailHeight: 212,
          caption: res.data.comment,
          isSelected: false
        };
        if (props.onNewAttachment) {
          props.onNewAttachment(att);
        }
      }
    );
  }

  function willSaveImage(dataUri: string, selectedFile: File, caption: string) {
    if (props.delegateSaveImage) {
      props.delegateSaveImage(dataUri, selectedFile, caption);
    } else {
      // fallback to default implementation
      handleSaveImage(dataUri, caption);
    }
    clearCamera();
  }

  useEffect(() => {
    setCameraIsOpen(props.openCameraOnRender);
  }, [props.openCameraOnRender]);

  return (
    <div className={styles.cameraSection}>
      {!props.shouldNotRenderButton && (
        <button className="cameraButton" onClick={openCamera}>
          {t("camera", "Camera")}
        </button>
      )}
      {cameraIsOpen && (
        <CameraFrame
          onCloseCamera={handleCloseCamera}
          setSelectedFile={setSelectedFile}
          inPreview={dataUri || selectedFile}
        >
          {dataUri || selectedFile ? (
            <ImagePreview
              dataUri={dataUri}
              selectedFile={selectedFile}
              onCancelCapture={handleCancelCapture}
              onSaveImage={willSaveImage}
              collectCaption={props.collectCaption ?? true}
            />
          ) : (
            <div id="camera-inner-wrapper">
              <Camera onTakePhoto={handleTakePhoto} />
            </div>
          )}
        </CameraFrame>
      )}
    </div>
  );
}

type CameraUploadProps = {
  openCameraOnRender?: boolean;
  collectCaption?: boolean;
  shouldNotRenderButton?: boolean;
  closeCamera?(): void;
  onTakePhoto?(dataUri: string): void;
  delegateSaveImage?(
    dataUri: string,
    selectedFile: File,
    caption: string
  ): void;
  selectedFile?: File;
  onNewAttachment?(att: Attachment): void;
};
