import React, { useRef, useCallback, useEffect, useContext, type MutableRefObject } from 'react';
import Camera from 'react-html5-camera-photo';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import 'react-html5-camera-photo/build/css/index.css';

interface CameraComponentProps {
  mediaStream: MutableRefObject<MediaStream | undefined>;
  stopCameraStream: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({ mediaStream, stopCameraStream }) => {
  const { handleTakePhoto, setError } = useContext(CameraMediaUploaderContext);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  const setMediaStream = useCallback(
    (ms: MediaStream) => {
      mediaStream.current = ms;
    },
    [mediaStream],
  );
  return (
    <Camera
      onTakePhoto={handleTakePhoto}
      onCameraStart={setMediaStream}
      onCameraStop={stopCameraStream}
      onCameraError={setError}
    />
  );
};

export default CameraComponent;
