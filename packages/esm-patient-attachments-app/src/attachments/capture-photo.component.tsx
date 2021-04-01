import React, { useEffect, useState } from "react";
import Button from "carbon-components-react/lib/components/Button";
import CameraUpload from "./camera-upload.component";
import placeholder from "../assets/placeholder.png";
import { toOmrsIsoString } from "@openmrs/esm-framework";

export default function CapturePhoto(props: CapturePhotoProps) {
  const [openCamera, setOpenCamera] = useState(false);
  const [dataUri, setDataUri] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(placeholder);
  const altText = "Photo preview";
  const showCamera = () => {
    setOpenCamera(true);
  };

  const closeCamera = () => {
    setOpenCamera(false);
  };

  useEffect(() => {
    if (props.initialState) {
      setCurrentPhoto(props.initialState);
    }
  }, []);

  const processCapturedImage = (dataUri: string, selectedFile: File) => {
    closeCamera();
    setDataUri(dataUri);
    setSelectedFile(selectedFile);
    props.onCapturePhoto(dataUri, selectedFile, toOmrsIsoString(new Date()));
  };

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
        <Button kind="ghost" onClick={(e) => showCamera()}>
          Change
        </Button>
        <CameraUpload
          openCameraOnRender={openCamera}
          shouldNotRenderButton={true}
          closeCamera={closeCamera}
          delegateSaveImage={processCapturedImage}
          collectCaption={false}
        />
      </div>
    </div>
  );
}

interface CapturePhotoProps {
  onCapturePhoto(
    dataUri: string,
    selectedFile: File,
    photoDateTime: string
  ): void;
  initialState?: string;
}
