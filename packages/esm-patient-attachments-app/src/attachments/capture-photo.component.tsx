import React, { useCallback, useEffect, useState } from "react";
import Button from "carbon-components-react/lib/components/Button";
import CameraUpload from "./camera-upload.component";
import placeholder from "../assets/placeholder.png";
import { toOmrsIsoString } from "@openmrs/esm-framework";

export interface CapturePhotoProps {
  patientUuid?: string;
  onCapturePhoto(
    dataUri: string,
    selectedFile: File,
    photoDateTime: string
  ): void;
  initialState?: string;
}

const CapturePhoto: React.FC<CapturePhotoProps> = ({
  patientUuid,
  initialState,
  onCapturePhoto
}) => {
  const [openCamera, setOpenCamera] = useState(false);
  const [dataUri, setDataUri] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(placeholder);
  const altText = "Photo preview";
  const showCamera = useCallback(() => {
    setOpenCamera(true);
  }, []);

  const closeCamera = useCallback(() => {
    setOpenCamera(false);
  }, []);

  const processCapturedImage = useCallback(
    (dataUri: string, selectedFile: File) => {
      closeCamera();
      setDataUri(dataUri);
      setSelectedFile(selectedFile);
      onCapturePhoto(dataUri, selectedFile, toOmrsIsoString(new Date()));
    },
    [onCapturePhoto]
  );

  useEffect(() => {
    if (initialState) {
      setCurrentPhoto(initialState);
    }
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ maxWidth: "20%", margin: "4px" }}>
        <img
          src={
            dataUri
              ? dataUri
              : selectedFile
              ? URL.createObjectURL(selectedFile)
              : currentPhoto
          }
          alt={altText}
          style={{ width: "100%" }}
        />
      </div>
      <div>
        <Button kind="ghost" onClick={showCamera}>
          Change
        </Button>
        <CameraUpload
          patientUuid={patientUuid}
          openCameraOnRender={openCamera}
          shouldNotRenderButton
          closeCamera={closeCamera}
          delegateSaveImage={processCapturedImage}
          collectCaption={false}
        />
      </div>
    </div>
  );
};

export default CapturePhoto;
