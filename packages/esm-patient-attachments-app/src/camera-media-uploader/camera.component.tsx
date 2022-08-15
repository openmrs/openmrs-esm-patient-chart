import React, { useRef, useCallback, useEffect, useContext } from 'react';
import Camera from 'react-html5-camera-photo';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import 'react-html5-camera-photo/build/css/index.css';

const CameraComponent: React.FC<{}> = () => {
  const { handleTakePhoto, setError } = useContext(CameraMediaUploaderContext);
  const mediaStream = useRef<MediaStream | undefined>();
  useEffect(() => {
    return () => {
      mediaStream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [mediaStream]);
  const setMediaStream = useCallback((ms: MediaStream) => {
    mediaStream.current = ms;
  }, []);
  return <Camera onTakePhoto={handleTakePhoto} onCameraStart={setMediaStream} onCameraError={setError} />;
};

export default CameraComponent;
